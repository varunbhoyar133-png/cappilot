import os
import re
import json
import pypdf
import time

def is_valid_category(w):
    w = w.upper()
    if w in ["TFWS", "ORPHAN", "EWS", "MI", "MINORITY"]:
        return True
    pattern = r'^(G|L|PWD|DEF|PWDR|DEFR)(OPEN|SC|ST|VJ|DT|NT1|NT2|NT3|NTB|NTC|NTD|OBC|SEBC|EWS)(H|O|S)?$'
    return bool(re.match(pattern, w))

def category_sort_key(cat):
    cat = cat.upper()
    if cat == "ORPHAN":
        return (5, 0)
    if cat == "TFWS":
        return (5, 1)
    if cat == "EWS":
        return (5, 2)
    if cat == "MI" or cat == "MINORITY":
        return (5, 3)
    
    match = re.match(r'^(G|L|PWD|DEF|PWDR|DEFR)(OPEN|SC|ST|VJ|DT|NT1|NT2|NT3|NTB|NTC|NTD|OBC|SEBC)(H|O|S)?$', cat)
    if not match:
        return (6, 0)
    
    prefix, base, suffix = match.groups()
    p_rank = {"G": 1, "L": 2, "PWD": 3, "PWDR": 3, "DEF": 4, "DEFR": 4}.get(prefix, 5)
    b_rank = {
        "OPEN": 1, "SC": 2, "ST": 3,
        "VJ": 4, "DT": 4,
        "NT1": 5, "NTB": 5,
        "NT2": 6, "NTC": 6,
        "NT3": 7, "NTD": 7,
        "OBC": 8, "SEBC": 9
    }.get(base, 10)
    
    return (p_rank, b_rank)

def parse_cutoff_coords(page):
    words_with_coords = []
    def visitor_body(text, cm, tm, fontDict, fontSize):
        val = text.strip()
        if val:
            words_with_coords.append({"val": val, "x": tm[4], "y": tm[5]})
            
    page.extract_text(visitor_text=visitor_body)
    
    if not words_with_coords:
        return []
        
    lines_dict = {}
    for item in words_with_coords:
        y = item["y"]
        found_y = None
        for existing_y in lines_dict:
            if abs(existing_y - y) < 4:
                found_y = existing_y
                break
        if found_y is None:
            lines_dict[y] = []
            found_y = y
        lines_dict[found_y].append(item)
        
    sorted_y = sorted(lines_dict.keys(), reverse=True)
    lines = []
    for y in sorted_y:
        lines.append({
            "y": y,
            "words": sorted(lines_dict[y], key=lambda item: item["x"])
        })
        
    choice_blocks = []
    current_college = None
    
    idx = 0
    while idx < len(lines):
        line_words = lines[idx]["words"]
        line_text = " ".join(item["val"] for item in line_words)
        
        # College Header
        col_match = re.match(r'^(\d{4,5})\s*-\s*(.+)$', line_text)
        if col_match:
            code, name = col_match.groups()
            if len(code) <= 5:
                current_college = {"code": code, "name": name}
                idx += 1
                continue
                
        # Choice Code Block
        choice_match = re.match(r'^(\d{9,10})\s*-\s*(.+)$', line_text)
        if choice_match:
            ccode, cname = choice_match.groups()
            choice_blocks.append({
                "college": current_college,
                "choice_code": ccode,
                "course_name": cname,
                "status": None,
                "allocations": []
            })
            idx += 1
            continue
            
        # Status
        if line_text.startswith("Status:") and choice_blocks:
            choice_blocks[-1]["status"] = line_text.replace("Status:", "").strip()
            idx += 1
            continue
            
        allocation_headers = [
            "State Level",
            "Home University Seats Allotted to Home University Candidates",
            "Home University Seats Allotted to Other Than Home University Candidates",
            "Other Than Home University Seats Allotted to Other Than Home University Candidates",
            "Other Than Home University Seats Allotted to Home University Candidates",
            "Minority Seats Allotted to Minority Candidates",
            "All India Seats Allotted to All India Candidates",
            "All India Seats"
        ]
        
        is_alloc = False
        alloc_name = None
        for alloc_h in allocation_headers:
            if line_text.startswith(alloc_h):
                alloc_name = alloc_h
                is_alloc = True
                break
                
        if is_alloc and choice_blocks:
            idx += 1
            cat_words = []
            while idx < len(lines):
                next_words = lines[idx]["words"]
                next_text = " ".join(item["val"] for item in next_words)
                if any(next_text.startswith(h) for h in allocation_headers) or re.match(r'^(\d{9,10})\s*-\s*(.+)$', next_text) or re.match(r'^(\d{4,5})\s*-\s*(.+)$', next_text):
                    break
                if next_text == "Stage" or "legends" in next_text.lower() or "maharashtra state seats" in next_text.lower():
                    break
                first_val = next_words[0]["val"]
                if first_val in ["I", "II", "III"] or first_val.isdigit():
                    break
                cat_words.extend(next_words)
                idx += 1
                
            cleaned_cats = []
            for item in cat_words:
                w = item["val"]
                if w in ['S', 'H', 'O'] and cleaned_cats:
                    cleaned_cats[-1]["val"] = cleaned_cats[-1]["val"] + w
                else:
                    cleaned_cats.append(item)
            
            categories = []
            for c in cleaned_cats:
                val = c["val"]
                for sub_w in val.split():
                    if is_valid_category(sub_w):
                        categories.append(sub_w)
            
            # Sort categories by visual relative order
            categories = sorted(categories, key=category_sort_key)
            
            value_tokens = []
            while idx < len(lines):
                next_words = lines[idx]["words"]
                next_text = " ".join(item["val"] for item in next_words)
                if any(next_text.startswith(h) for h in allocation_headers) or re.match(r'^(\d{9,10})\s*-\s*(.+)$', next_text) or re.match(r'^(\d{4,5})\s*-\s*(.+)$', next_text):
                    break
                if next_text == "Stage" or "legends" in next_text.lower() or "maharashtra state seats" in next_text.lower() or next_text == "1":
                    idx += 1
                    continue
                value_tokens.extend(next_words)
                idx += 1
                
            ranks = []
            percentiles = []
            current_stage = "I"
            for t in value_tokens:
                val = t["val"]
                if val in ["I", "II", "III"]:
                    current_stage = val
                elif val.isdigit() and len(val) >= 2:
                    ranks.append({"rank": int(val), "x": t["x"], "y": t["y"], "stage": current_stage})
                elif val.startswith("(") and val.endswith(")"):
                    percentiles.append({"percentile": float(val.strip("()")), "x": t["x"], "y": t["y"]})
                    
            cutoffs = []
            for r in ranks:
                matched_p = None
                for p in percentiles:
                    if abs(p["x"] - r["x"]) < 5 and 0 < (r["y"] - p["y"]) < 12:
                        matched_p = p["percentile"]
                        break
                col_idx = int(round((r["x"] - 73.0) / 51.25))
                category = categories[col_idx] if 0 <= col_idx < len(categories) else None
                
                # Dynamic fallback if out of bounds (assign next closest or mark as General)
                if category is None and categories:
                    category = categories[min(col_idx, len(categories) - 1)]
                
                if category:
                    cutoffs.append({
                        "category": category,
                        "rank": r["rank"],
                        "percentile": matched_p,
                        "stage": r["stage"]
                    })
                
            choice_blocks[-1]["allocations"].append({
                "name": alloc_name,
                "categories": categories,
                "cutoffs": cutoffs
            })
            continue
        idx += 1
    return choice_blocks

def parse_seat_matrix_page(page):
    text = page.extract_text()
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    
    college_code = None
    college_name = None
    choice_code = None
    course_name = None
    si = 0
    ms = 0
    minority = 0
    all_india = 0
    institute = 0
    orphan = 0
    ews = 0
    tfws = 0
    tfws_choice_code = None
    
    for idx, line in enumerate(lines):
        col_match = re.match(r'^(\d{4,5})\s*-\s*(.+)$', line)
        if col_match and not college_code:
            college_code, college_name = col_match.groups()
            
        choice_match = re.match(r'^(\d{9,10})$', line)
        if choice_match and not choice_code:
            choice_code = choice_match.group(1)
            if idx + 1 < len(lines):
                course_name = lines[idx+1]
                
        if "Economically Weaker Section" in line:
            if idx + 1 < len(lines) and lines[idx+1].isdigit():
                ews = int(lines[idx+1])
                
        if "Tution Fee Waiver Scheme Choice Code" in line or "Tuition Fee Waiver Scheme Choice Code" in line:
            if idx + 1 < len(lines):
                tfws_choice_code = lines[idx+1]
            for offset in range(1, 5):
                if idx + offset < len(lines) and "Seats:" in lines[idx+offset]:
                    if idx + offset + 1 < len(lines) and lines[idx+offset+1].isdigit():
                        tfws = int(lines[idx+offset+1])
                        break
                        
    try:
        c_idx = lines.index(choice_code) if choice_code in lines else -1
        if c_idx != -1:
            numbers = []
            for line in lines[c_idx+2:c_idx+10]:
                if line.isdigit():
                    numbers.append(int(line))
            if len(numbers) >= 5:
                si = numbers[0]
                ms = numbers[1]
                minority = numbers[2]
                all_india = numbers[3]
                institute = numbers[4]
                if len(numbers) >= 6:
                    orphan = numbers[5]
    except Exception:
        pass
        
    return {
        "college_code": college_code,
        "college_name": college_name,
        "choice_code": choice_code,
        "course_name": course_name,
        "sanctioned_intake": si,
        "ms_seats": ms,
        "minority_seats": minority,
        "all_india_seats": all_india,
        "institute_seats": institute,
        "orphan_seats": orphan,
        "ews_seats": ews,
        "tfws_seats": tfws,
        "tfws_choice_code": tfws_choice_code
    }

def main():
    data_dir = "data"
    parsed_dir = os.path.join(data_dir, "parsed")
    os.makedirs(parsed_dir, exist_ok=True)
    
    # Traverse directories under data/
    year_dirs = [d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d)) and d != "parsed"]
    print(f"Detected years: {year_dirs}")
    
    for year in year_dirs:
        year_path = os.path.join(data_dir, year)
        year_out_dir = os.path.join(parsed_dir, year)
        os.makedirs(year_out_dir, exist_ok=True)
        
        print(f"\nProcessing Year: {year}")
        files = os.listdir(year_path)
        
        # 1. Parse Seat Matrix
        sm_file = next((f for f in files if "seatmatrix" in f.lower() or "seat_matrix" in f.lower()), None)
        if sm_file:
            sm_file_path = os.path.join(year_path, sm_file)
            sm_out_path = os.path.join(year_out_dir, "seat_matrix.json")
            if not os.path.exists(sm_out_path):
                print(f"Parsing Seat Matrix PDF: {sm_file} ...")
                t0 = time.time()
                reader = pypdf.PdfReader(sm_file_path)
                results = []
                for idx, page in enumerate(reader.pages):
                    res = parse_seat_matrix_page(page)
                    if res["choice_code"]:
                        results.append(res)
                with open(sm_out_path, "w", encoding="utf-8") as f:
                    json.dump(results, f, indent=2)
                print(f"Finished Seat Matrix: Extracted {len(results)} records in {round(time.time() - t0, 1)}s.")
            else:
                print("Seat Matrix JSON already parsed, skipping.")
        else:
            print("No Seat Matrix PDF found.")
            
        # 2. Parse Cutoffs
        cutoff_files = [f for f in files if "cutoff" in f.lower() or "cut_off" in f.lower()]
        for cf in cutoff_files:
            # Determine round from filename
            round_match = re.search(r'cap(\d)', cf, re.IGNORECASE)
            round_num = int(round_match.group(1)) if round_match else 1
            
            cf_file_path = os.path.join(year_path, cf)
            cf_out_path = os.path.join(year_out_dir, f"cutoffs_r{round_num}.json")
            
            if not os.path.exists(cf_out_path):
                print(f"Parsing Cutoff PDF (Round {round_num}): {cf} ...")
                t0 = time.time()
                reader = pypdf.PdfReader(cf_file_path)
                results = []
                for idx, page in enumerate(reader.pages):
                    res = parse_cutoff_coords(page)
                    if res:
                        results.extend(res)
                with open(cf_out_path, "w", encoding="utf-8") as f:
                    json.dump(results, f, indent=2)
                print(f"Finished Cutoffs Round {round_num}: Extracted {len(results)} blocks in {round(time.time() - t0, 1)}s.")
            else:
                print(f"Cutoff JSON for Round {round_num} already parsed, skipping.")

if __name__ == "__main__":
    main()

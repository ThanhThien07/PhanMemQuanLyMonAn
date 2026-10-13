import sys, docx
sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('CDBackEnd.docx')

print(f"Total paragraphs: {len(doc.paragraphs)}")
print(f"Total tables: {len(doc.tables)}")
print(f"Total sections: {len(doc.sections)}")

styles_found = set(p.style.name for p in doc.paragraphs)
print("Styles found:", sorted(list(styles_found)))

heading1_list = [p.text for p in doc.paragraphs if p.style.name == 'Heading 1']
print(f"\nHeading 1 ({len(heading1_list)}):", heading1_list)

heading2_list = [p.text for p in doc.paragraphs if p.style.name == 'Heading 2']
print(f"\nHeading 2 ({len(heading2_list)}):", heading2_list[:10], "... (total:", len(heading2_list), ")")

heading4_list = [p.text for p in doc.paragraphs if p.style.name == 'Heading 4']
print(f"\nHeading 4 (Figures - {len(heading4_list)}):", heading4_list[:5], "... (total:", len(heading4_list), ")")

heading5_list = [p.text for p in doc.paragraphs if p.style.name == 'Heading 5']
print(f"\nHeading 5 (Tables - {len(heading5_list)}):", heading5_list[:5], "... (total:", len(heading5_list), ")")

print("\nSections footer page number status:")
for idx, sec in enumerate(doc.sections):
    xml = sec.footer._element.xml
    has_page = 'PAGE' in xml
    print(f"  Section {idx}: has_page_number={has_page}")

images_count = 0
for p in doc.paragraphs:
    images_count += len(p._element.xpath('.//a:blip/@r:embed'))
print(f"\nTotal image blips embedded: {images_count}")

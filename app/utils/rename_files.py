import os

folder_path = r"C:\Users\osur1\Documents\personal\IT\pet_projects\MebelLanding\public\images\viko_catalog"

for filename in os.listdir(folder_path):
    if filename.startswith("VIKO CATALOG 2026_"):
        old_path = os.path.join(folder_path, filename)

        new_name = filename.replace("VIKO CATALOG 2026_", "")
        new_path = os.path.join(folder_path, new_name)

        os.rename(old_path, new_path)

print("Done")

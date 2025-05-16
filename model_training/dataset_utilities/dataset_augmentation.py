# Utility script to generate additional PascalVOC encoded dataset images through rotation.

import os
import shutil
import random
import xml.etree.ElementTree as ET
from PIL import Image
from sklearn.model_selection import train_test_split

# === CONFIGURATION ===
INPUT_DIR = "./datasets/sheep_video_01/original_video_01"  # Replace with your folder containing .jpg/.xml files
OUTPUT_DIR = "./augmented_datasets/sheep_video_01"

ROTATIONS = [0, 90, 180, 270]  # 0 = original, 360 not needed

# === FUNCTIONS ===

def parse_annotation(xml_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()
    boxes = []
    for obj in root.findall("object"):
        bbox = obj.find("bndbox")
        box = (
            int(float(bbox.find("xmin").text)),
            int(float(bbox.find("ymin").text)),
            int(float(bbox.find("xmax").text)),
            int(float(bbox.find("ymax").text))
        )
        boxes.append((obj, box))
    return tree, boxes


def rotate_box(box, angle, w, h):
    x_min, y_min, x_max, y_max = box
    if angle == 90:
        return (y_min, w - x_max, y_max, w - x_min)
    elif angle == 180:
        return (w - x_max, h - y_max, w - x_min, h - y_min)
    elif angle == 270:
        return (h - y_max, x_min, h - y_min, x_max)
    return box  # angle == 0


def update_annotation(tree, boxes, angle, w, h):
    for (obj, box) in boxes:
        new_box = rotate_box(box, angle, w, h)
        bbox = obj.find("bndbox")
        bbox.find("xmin").text = str(new_box[0])
        bbox.find("ymin").text = str(new_box[1])
        bbox.find("xmax").text = str(new_box[2])
        bbox.find("ymax").text = str(new_box[3])
    return tree


def augment_and_save(image_path, xml_path, output_dir):
    image = Image.open(image_path)
    w, h = image.size
    base = os.path.splitext(os.path.basename(image_path))[0]
    tree, boxes = parse_annotation(xml_path)

    new_files = []

    for angle in ROTATIONS:
        rotated = image.rotate(angle, expand=True)
        new_img_name = f"{base}_rot{angle}.jpg"
        new_xml_name = f"{base}_rot{angle}.xml"

        rotated.save(os.path.join(output_dir, new_img_name))

        new_tree = update_annotation(tree, boxes, angle, w, h)
        new_tree.write(os.path.join(output_dir, new_xml_name))

        new_files.append((new_img_name, new_xml_name))

    return new_files


def split_and_save(all_files, output_dir):
    random.shuffle(all_files)
    train, temp = train_test_split(all_files, test_size=0.2)
    val, test = train_test_split(temp, test_size=0.5)

    splits = {"train": train, "val": val, "test": test}

    for split_name, files in splits.items():
        split_path = os.path.join(output_dir, split_name)
        os.makedirs(split_path, exist_ok=True)
        for img, xml in files:
            shutil.move(os.path.join(output_dir, img), os.path.join(split_path, img))
            shutil.move(os.path.join(output_dir, xml), os.path.join(split_path, xml))


# === MAIN EXECUTION ===

if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    all_augmented_files = []

    for file in os.listdir(INPUT_DIR):
        if file.endswith(".jpg"):
            base = os.path.splitext(file)[0]
            img_path = os.path.join(INPUT_DIR, file)
            xml_path = os.path.join(INPUT_DIR, f"{base}.xml")
            if os.path.exists(xml_path):
                augmented = augment_and_save(img_path, xml_path, OUTPUT_DIR)
                all_augmented_files.extend(augmented)

    split_and_save(all_augmented_files, OUTPUT_DIR)
    print("✅ Dataset augmentation and splitting complete.")

"""
Generate branded Android & PWA icons for NammaKannada (NK)
"""
import os
from PIL import Image, ImageDraw, ImageFont

def generate_icons():
    public_dir = r"c:\hackathon\frontend\public"
    app_dir = r"c:\hackathon\frontend\app"
    res_dir = r"c:\hackathon\frontend\android\app\src\main\res"

    sizes = [
        (192, os.path.join(public_dir, "icon-192.png")),
        (512, os.path.join(public_dir, "icon-512.png")),
        (192, os.path.join(public_dir, "icon-maskable-192.png")),
        (512, os.path.join(public_dir, "icon-maskable-512.png")),
        (180, os.path.join(public_dir, "apple-touch-icon.png")),
        (32, os.path.join(public_dir, "favicon-32x32.png")),
        (16, os.path.join(public_dir, "favicon-16x16.png")),
    ]

    # Native Android mipmap sizes
    android_sizes = [
        (48, os.path.join(res_dir, "mipmap-mdpi")),
        (72, os.path.join(res_dir, "mipmap-hdpi")),
        (96, os.path.join(res_dir, "mipmap-xhdpi")),
        (144, os.path.join(res_dir, "mipmap-xxhdpi")),
        (192, os.path.join(res_dir, "mipmap-xxxhdpi")),
    ]

    for size, path in sizes:
        img = Image.new("RGBA", (size, size), (15, 23, 42, 255)) # Dark slate background #0f172a
        draw = ImageDraw.Draw(img)

        # Draw rounded amber card / circle in center
        margin = size // 8
        draw.rounded_rectangle(
            [margin, margin, size - margin, size - margin],
            radius=size // 5,
            fill=(245, 158, 11, 255), # Amber #f59e0b
        )

        center_x = size // 2
        center_y = size // 2
        
        # Draw "NK"
        try:
            font_size = int(size // 2.8)
            # Try arialbd.ttf (Arial Bold) or arial.ttf
            try:
                font = ImageFont.truetype("arialbd.ttf", font_size)
            except Exception:
                font = ImageFont.truetype("arial.ttf", font_size)
            draw.text((center_x, center_y), "NK", fill=(15, 23, 42, 255), font=font, anchor="mm")
        except Exception:
            r = size // 6
            draw.ellipse([center_x - r, center_y - r, center_x + r, center_y + r], fill=(15, 23, 42, 255))

        img.save(path, "PNG")
        print(f"Generated {path}")

    # Generate multi-size favicon.ico
    fav_images = []
    for fav_size in [16, 32, 48, 64]:
        fav_img = Image.new("RGBA", (fav_size, fav_size), (245, 158, 11, 255))
        fav_draw = ImageDraw.Draw(fav_img)
        try:
            f_size = int(fav_size // 1.9)
            try:
                f_font = ImageFont.truetype("arialbd.ttf", f_size)
            except Exception:
                f_font = ImageFont.truetype("arial.ttf", f_size)
            fav_draw.text((fav_size // 2, fav_size // 2), "NK", fill=(15, 23, 42, 255), font=f_font, anchor="mm")
        except Exception:
            pass
        fav_images.append(fav_img)

    for target_ico in [os.path.join(public_dir, "favicon.ico"), os.path.join(app_dir, "favicon.ico")]:
        fav_images[0].save(
            target_ico,
            format="ICO",
            sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
            append_images=fav_images[1:],
        )
        print(f"Generated {target_ico}")

    # Generate legacy android mipmap icons
    for size, folder in android_sizes:
        if os.path.exists(folder):
            img = Image.new("RGBA", (size, size), (245, 158, 11, 255))
            draw = ImageDraw.Draw(img)
            try:
                font_size = int(size // 2.2)
                try:
                    font = ImageFont.truetype("arialbd.ttf", font_size)
                except Exception:
                    font = ImageFont.truetype("arial.ttf", font_size)
                draw.text((size // 2, size // 2), "NK", fill=(15, 23, 42, 255), font=font, anchor="mm")
            except Exception:
                pass
            launcher_path = os.path.join(folder, "ic_launcher.png")
            round_path = os.path.join(folder, "ic_launcher_round.png")
            img.save(launcher_path, "PNG")
            img.save(round_path, "PNG")
            print(f"Updated Android icon: {launcher_path}")

    # Foreground sizes for Android adaptive icons (108dp canvas)
    # mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432
    android_fg_sizes = [
        (108, os.path.join(res_dir, "mipmap-mdpi")),
        (162, os.path.join(res_dir, "mipmap-hdpi")),
        (216, os.path.join(res_dir, "mipmap-xhdpi")),
        (324, os.path.join(res_dir, "mipmap-xxhdpi")),
        (432, os.path.join(res_dir, "mipmap-xxxhdpi")),
    ]

    for fg_size, folder in android_fg_sizes:
        if os.path.exists(folder):
            fg_img = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0)) # Transparent background
            draw = ImageDraw.Draw(fg_img)
            
            # Safe zone: centered rounded rectangle taking ~60% of canvas
            margin = int(fg_size * 0.18)
            draw.rounded_rectangle(
                [margin, margin, fg_size - margin, fg_size - margin],
                radius=int(fg_size * 0.16),
                fill=(245, 158, 11, 255), # Amber #f59e0b
            )

            font_size = int(fg_size * 0.28)
            try:
                try:
                    font = ImageFont.truetype("arialbd.ttf", font_size)
                except Exception:
                    font = ImageFont.truetype("arial.ttf", font_size)
                draw.text((fg_size // 2, fg_size // 2), "NK", fill=(15, 23, 42, 255), font=font, anchor="mm")
            except Exception:
                pass

            fg_path = os.path.join(folder, "ic_launcher_foreground.png")
            fg_img.save(fg_path, "PNG")
            print(f"Updated Android adaptive foreground: {fg_path}")

    # Update ic_launcher_background.xml
    bg_xml_path = os.path.join(res_dir, "values", "ic_launcher_background.xml")
    if os.path.exists(bg_xml_path):
        with open(bg_xml_path, "w", encoding="utf-8") as f:
            f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0f172a</color>\n</resources>\n')
        print(f"Updated {bg_xml_path}")

    print("All NK icons successfully generated!")

if __name__ == "__main__":
    generate_icons()


#!/bin/bash

export DEBIAN_FRONTEND=noninteractive

clear
echo -e "\e[1;36m┏━━━━✿︎ Kazuma-Mr-Bot ✿︎━━━━╮\e[0m"
echo -e "\e[1;36m┃ \e[0m\e[1;33m✐ Instalador Universal Pro\e[0m"
echo -e "\e[1;36m┃ \e[0m\e[1;32m✐ Pterodactyl • VPS • Termux\e[0m"
echo -e "\e[1;36m╰━━━━━━━━━━━━━━━━━━━╯\e[0m"
echo ""

IS_TERMUX=false
if [[ $(command -v termux-setup-storage) ]]; then
    IS_TERMUX=true
    termux-setup-storage -y
    pkg install git nodejs ffmpeg libwebp -y
fi

echo -e "\e[1;34m[*] Instalando módulos...\e[0m"
rm -rf node_modules package-lock.json

if [ "$IS_TERMUX" = true ]; then
    npm config set ignore-scripts true
    npm install --no-bin-links
    
    echo -e "\e[1;34m[*] Aplicando bypass final para Termux...\e[0m"
    
    FAKE_SHARP="const s = () => ({ toBuffer: () => Promise.resolve(Buffer.alloc(0)), resize: () => s(), webp: () => s(), png: () => s(), format: () => s() }); s.format = () => ({}); s.libvipsVersion = () => '0.0.0'; s.versions = { vips: '0.0.0' }; module.exports = s;"
    
    mkdir -p "./node_modules/sharp/lib"
    echo "$FAKE_SHARP" > "./node_modules/sharp/index.js"
    echo "$FAKE_SHARP" > "./node_modules/sharp/lib/sharp.js"
    
    mkdir -p "./node_modules/wa-sticker-formatter/node_modules/sharp/lib"
    echo "$FAKE_SHARP" > "./node_modules/wa-sticker-formatter/node_modules/sharp/index.js"
    echo "$FAKE_SHARP" > "./node_modules/wa-sticker-formatter/node_modules/sharp/lib/sharp.js"

    UTILITY_PATCH="module.exports = function() { return { vendorLibvips: '0.0.0', pkgConfigLibvips: '0.0.0' }; };"
    
    U1="./node_modules/sharp/lib/utility.js"
    U2="./node_modules/wa-sticker-formatter/node_modules/sharp/lib/utility.js"
    
    [ -f "$U1" ] && echo "$UTILITY_PATCH" > "$U1"
    [ -f "$U2" ] && echo "$UTILITY_PATCH" > "$U2"
else
    npm install
fi

clear
echo -e "\e[1;32m[!] Instalación lista. Iniciando bot...\e[0m"
sleep 2
npm start
#!/bin/bash

npm install
npm run build

# 创建用户 systemd 目录
mkdir -p ~/.config/systemd/user

# 复制服务文件
cp auto-mcd-coupon.service ~/.config/systemd/user/
cp auto-mcd-coupon.timer ~/.config/systemd/user/

# 重新加载 systemd 用户配置
systemctl --user daemon-reload

# 启用并启动定时器
systemctl --user enable auto-mcd-coupon.timer
systemctl --user start auto-mcd-coupon.timer

echo "✅ Systemd 用户服务已安装并启动"
echo "📅 将在每天上午 10:45 自动运行"
echo ""
echo "查看状态: systemctl --user status auto-mcd-coupon.timer"
echo "查看日志: journalctl --user -u auto-mcd-coupon.service"

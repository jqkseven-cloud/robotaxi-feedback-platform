#!/bin/bash

# Robotaxi 乘客反馈管理平台 - 一键启动脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "🚀 启动 Robotaxi 反馈管理平台..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ 请先安装 Node.js (>= 18)"
  exit 1
fi

# Check .env
if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "⚠️  未找到 backend/.env 文件，正在从 .env.example 复制..."
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
  echo "   请编辑 backend/.env 填入 DASHSCOPE_API_KEY 以启用 AI 功能"
  echo ""
fi

# Start backend
echo "📡 启动后端服务 (端口 3001)..."
cd "$BACKEND_DIR"
npm run dev &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 3

# Start frontend
echo "🎨 启动前端服务 (端口 5173)..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 平台启动成功！"
echo "   🌐 前端地址: http://localhost:5173"
echo "   🔌 后端接口: http://localhost:3001"
echo ""
echo "按 Ctrl+C 停止所有服务"

# Cleanup on exit
cleanup() {
  echo ""
  echo "正在停止服务..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  echo "已停止"
}
trap cleanup EXIT INT TERM

wait

#!/usr/bin/env python3
"""
定时任务调度器 - 定期运行 AI News Scraper
"""

import schedule
import time
import subprocess
from datetime import datetime
import sys

def run_scraper():
    """运行抓取器"""
    print(f"\n{'='*50}")
    print(f"⏰ 定时任务触发: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*50}")

    try:
        result = subprocess.run(
            [sys.executable, "scraper.py"],
            capture_output=True,
            text=True,
            check=True
        )
        print(result.stdout)
        if result.stderr:
            print("⚠️ 警告:", result.stderr)
    except subprocess.CalledProcessError as e:
        print(f"❌ 抓取失败: {e}")
        print(e.stderr)

def main():
    """主函数"""
    print("🕐 AI News Scheduler 启动...")

    # 从环境变量或配置读取间隔时间（默认每2小时）
    interval_hours = 2

    # 设置定时任务
    schedule.every(interval_hours).hours.do(run_scraper)

    print(f"⚙️  已设置每 {interval_hours} 小时自动抓取一次")
    print("按 Ctrl+C 退出\n")

    # 先运行一次
    run_scraper()

    # 持续运行
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # 每分钟检查一次
    except KeyboardInterrupt:
        print("\n\n👋 定时调度器已停止")

if __name__ == '__main__':
    main()

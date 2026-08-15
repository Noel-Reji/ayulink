"""
AyuLink Auto-Git Synchronization Watcher
Monitors the workspace for file changes, automatically commits, and pushes to GitHub.
"""

import subprocess
import time
import os
from datetime import datetime

WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))

def run_git_cmd(cmd_args):
    try:
        res = subprocess.run(
            ["git"] + cmd_args,
            cwd=WORKSPACE_DIR,
            capture_output=True,
            text=True,
            timeout=30
        )
        return res.returncode, res.stdout.strip(), res.stderr.strip()
    except Exception as e:
        return 1, "", str(e)

def has_changes():
    code, out, _ = run_git_cmd(["status", "--porcelain"])
    return code == 0 and len(out) > 0

def auto_sync():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Checking for workspace changes...")
    if not has_changes():
        return

    # Get list of changed files for the commit message
    _, status_out, _ = run_git_cmd(["status", "--short"])
    changed_lines = status_out.splitlines()[:5]
    summary = ", ".join([line.strip().split()[-1] for line in changed_lines])
    if len(status_out.splitlines()) > 5:
        summary += f" and {len(status_out.splitlines()) - 5} more files"

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    commit_msg = f"Auto-update: {summary} ({timestamp})"

    print(f"[*] Detected changes in: {summary}")
    print("[*] Staging files...")
    run_git_cmd(["add", "."])

    print(f"[*] Committing: '{commit_msg}'...")
    code, cout, cerr = run_git_cmd(["commit", "-m", commit_msg])
    if code != 0:
        print(f"[!] Commit note: {cerr or cout}")
        return

    print("[*] Pushing to remote (origin main)...")
    pcode, pout, perr = run_git_cmd(["push", "origin", "main"])
    if pcode == 0:
        print(f"[+] Successfully pushed changes to GitHub! ({timestamp})")
    else:
        print(f"[!] Push deferred (Remote may need creation or authentication): {perr or pout}")

def main():
    print("==================================================")
    print("  AyuLink Real-Time Git Auto-Sync Daemon Started  ")
    print(f"  Watching: {WORKSPACE_DIR}")
    print("==================================================")
    
    # Run once at startup
    auto_sync()

    try:
        while True:
            time.sleep(5)  # Checks every 5 seconds for newly saved modifications
            if has_changes():
                auto_sync()
    except KeyboardInterrupt:
        print("\n[*] Auto-sync watcher stopped.")

if __name__ == "__main__":
    main()

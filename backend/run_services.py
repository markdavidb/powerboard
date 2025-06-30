# run_services.py
import subprocess
import sys
import os
import signal
import time
import threading

from dotenv import load_dotenv
load_dotenv()

from common.database import Base, engine
Base.metadata.create_all(bind=engine)

#
RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
UNDERLINE = "\033[4m"

RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"
MAGENTA = "\033[35m"
CYAN = "\033[36m"
WHITE = "\033[37m"

SERVICE_COLORS = [CYAN, GREEN, YELLOW, MAGENTA, BLUE]

# Services to run
SERVICES = [
    ("services.user_service.main:app", 8001),
    ("services.project_service.main:app", 8002),
    ("services.analytics_service.main:app", 8003),
    ("services.notification_service.main:app", 8004),
    ("services.scheduler_service.main:app", 8005),
    ("services.realtime_gateway.main:app", 9000),
    ("services.ai_service.main:app", 8006),

]


def colorize_log(line):
    # Apply colors based on method or status
    if "GET" in line:
        line = line.replace("GET", f"{GREEN}GET{RESET}")
    if "POST" in line:
        line = line.replace("POST", f"{CYAN}POST{RESET}")
    if "PUT" in line:
        line = line.replace("PUT", f"{YELLOW}PUT{RESET}")
    if "DELETE" in line:
        line = line.replace("DELETE", f"{RED}DELETE{RESET}")
    if "200 OK" in line:
        line = line.replace("200 OK", f"{GREEN}200 OK{RESET}")
    if "201 Created" in line:
        line = line.replace("201 Created", f"{GREEN}201 Created{RESET}")
    if "400 Bad Request" in line:
        line = line.replace("400 Bad Request", f"{YELLOW}400 Bad Request{RESET}")
    if "404 Not Found" in line:
        line = line.replace("404 Not Found", f"{YELLOW}404 Not Found{RESET}")
    if "500 Internal Server Error" in line:
        line = line.replace("500 Internal Server Error", f"{RED}500 Internal Server Error{RESET}")
    return line


def stream_output(service_name, color, process):
    for line in iter(process.stdout.readline, b''):
        try:
            line = line.decode('utf-8').rstrip()
            if not line:
                continue
            colored_line = colorize_log(line)
            print(f"{color}[{service_name}]{RESET} {colored_line}")
        except Exception:
            continue


def start_services():
    procs = []
    root_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(root_dir)

    print(f"\n{BOLD}{CYAN}🚀 Starting Services in DEBUG mode{RESET}\n")

    for idx, (module, port) in enumerate(SERVICES):
        service_name = module.split(":")[0]
        cmd = [
            sys.executable, "-m", "uvicorn",
            module,
            "--host", "0.0.0.0",
            "--port", str(port),
            "--reload",
            "--log-level", "debug",
        ]

        print(f"{GREEN}▶️  Launching {BOLD}{service_name}{RESET}{GREEN} at {UNDERLINE}http://localhost:{port}{RESET}")

        p = subprocess.Popen(
            cmd,
            cwd=root_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            preexec_fn=os.setsid if os.name != "nt" else None,
            bufsize=1
        )
        color = SERVICE_COLORS[idx % len(SERVICE_COLORS)]
        t = threading.Thread(target=stream_output, args=(service_name, color, p), daemon=True)
        t.start()

        procs.append((service_name, p))
        time.sleep(0.5)

    return procs


def shutdown_services(procs):
    print(f"\n{RED}🛑 Shutting down services...{RESET}")
    for service_name, p in procs:
        try:
            if os.name == "nt":
                p.terminate()
            else:
                os.killpg(os.getpgid(p.pid), signal.SIGTERM)
            print(f"{YELLOW}⚡ Terminated {service_name}{RESET}")
        except Exception as e:
            print(f"{RED}⚠️ Failed to terminate {service_name}: {e}{RESET}")
    for _, p in procs:
        p.wait()
    print(f"\n{BOLD}{GREEN}✅ All services stopped cleanly.{RESET}")


if __name__ == "__main__":
    try:
        processes = start_services()
        print(f"\n{BOLD}{MAGENTA}✅ All services launched!{RESET} {DIM}(Press Ctrl+C to stop){RESET}\n")
        signal.pause()
    except (KeyboardInterrupt, AttributeError):
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
    finally:
        shutdown_services(processes)

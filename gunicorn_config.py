import os

bind = "0.0.0.0:" + str(os.environ.get('PORT', 5000))
workers = 4
worker_class = "gevent"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
timeout = 120
keepalive = 2
preload_app = True

# Memory management
max_requests = 1000
max_requests_jitter = 100

# Logging
loglevel = 'info'
accesslog = '-'
errorlog = '-'
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Performance tuning
worker_tmp_dir = '/dev/shm'  # Use memory for temporary files
reuse_port = True
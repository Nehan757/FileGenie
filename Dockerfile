FROM public.ecr.aws/lambda/python:3.11
ENV PIP_NO_CACHE_DIR=1 PYTHONDONTWRITEBYTECODE=1
COPY requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install --upgrade pip && pip install -r ${LAMBDA_TASK_ROOT}/requirements.txt --target "${LAMBDA_TASK_ROOT}"
COPY app.py lambda_handler.py gunicorn_config.py ${LAMBDA_TASK_ROOT}/
CMD ["lambda_handler.handler"]

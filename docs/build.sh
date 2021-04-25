insomnia-documenter --config $1 -o .
docker build -t registry.gitlab.com/worldtech-ltd/worldcare-api-doc:latest .
docker push registry.gitlab.com/worldtech-ltd/worldcare-api-doc:latest
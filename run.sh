#!/bin/bash

set -e

echo "Starting backend (Node.js)..."
cd backend
node index.js &

echo "Starting frontend (Angular)..."
cd ../frontend
ng serve


# run file
# chmod +x run.sh
# ./run.sh
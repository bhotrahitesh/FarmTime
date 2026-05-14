#!/bin/bash

# Set Java 17 for this project
export JAVA_HOME="/Users/hiteshrajbhotra/Library/Java/JavaVirtualMachines/ms-17.0.16/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

echo "Using Java version:"
java -version

echo ""
echo "Starting FarmTime Backend with Neon Database..."
echo "Database: farmtime_db on Neon"
echo "=========================================="

mvn spring-boot:run -Dspring-boot.run.profiles=neon

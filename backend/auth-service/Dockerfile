# Multi-stage build for Spring Boot application
FROM maven:3.9.5 AS build

# Set working directory
WORKDIR /app

# Create Maven directory and copy settings for SSL bypass
RUN mkdir -p /root/.m2
COPY maven-settings.xml /root/.m2/settings.xml

# Copy the parent pom.xml first
COPY pom.xml ./parent-pom.xml

# Copy the service pom.xml
COPY auth-service/pom.xml ./pom.xml

# Copy the parent pom.xml to the expected location
RUN mkdir -p .. && cp parent-pom.xml ../pom.xml

# Download dependencies (with custom settings)
RUN mvn dependency:go-offline -B -s /root/.m2/settings.xml

# Copy source code
COPY auth-service/src ./src

# Build the application (with custom settings, skip tests)
RUN mvn clean package -DskipTests -Dmaven.test.skip=true -s /root/.m2/settings.xml

# Runtime stage
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy the built jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Change ownership to appuser
RUN chown appuser:appuser app.jar

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8081

# Health check disabled for now

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"] 
# Stage 1: Build the jar using the project's Maven Wrapper and Java 25
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Install Maven
RUN apt-get update && apt-get install -y maven

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src src
RUN mvn package -DskipTests

# Stage 2: Run the application on a lightweight Java 25 JRE runtime
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
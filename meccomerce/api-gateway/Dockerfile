FROM eclipse-temurin:17-jdk-alpine as builder
WORKDIR /app
COPY pom.xml .
COPY common-library common-library
COPY api-gateway api-gateway
COPY mvnw .
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw clean package -pl api-gateway -am -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/api-gateway/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

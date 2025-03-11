
The application includes built-in monitoring and observability features:

- **Application Metrics**: Exposed at `/metrics` endpoint in Prometheus format
- **Health Checks**: Available at `/health` endpoint
- **Grafana Dashboard**: Pre-configured dashboards for key metrics
- **Alerting**: Configured in Prometheus for critical conditions

## Load Testing

Load testing is performed using K6. To run load tests locally:

```bash
# Install k6
npm install -g k6

# Run load test
k6 run k6/load-test.js
```

The CI/CD pipeline automatically runs load tests against staging environments.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# Security Guidelines

This document outlines the security practices implemented in this project and guidelines for maintaining security.

## Environment Variables

### Setup
1. Copy `.env.example` to `.env`
2. Fill in your actual values in the `.env` file
3. Never commit the `.env` file to version control

### Available Variables
- `REACT_APP_COMPANY_NAME`: Your company name
- `REACT_APP_PRODUCT_NAME`: Your product name
- `REACT_APP_API_BASE_URL`: API server URL
- `REACT_APP_WS_SERVER_URL`: WebSocket server URL
- Other configuration variables as needed

## Sensitive Information Sanitized

The following sensitive information has been replaced with generic placeholders:

### Company and Product Names
- **Original**: "Anywhere Networks" → **Sanitized**: "YOUR_COMPANY_NAME"
- **Original**: "Cikata Networks" → **Sanitized**: "OEM_COMPANY_NAME"
- **Original**: "Anywhere Node Manager" → **Sanitized**: "Generic Node Manager"
- **Original**: "Cikata Node Manager" → **Sanitized**: "OEM Node Manager"

### Repository URLs
- **Original**: Internal GitLab repository → **Sanitized**: Generic GitHub placeholder

### Configuration Files Sanitized
- `package.json`: Repository URL replaced
- `build_config/prod-settings.json`: Company and product names replaced
- `build_config/sdk-settings.json`: Company and product names replaced
- `build_config/oem/prod-settings.json`: Company and product names replaced
- `build_config/oem/sdk-settings.json`: Company and product names replaced
- `public/manifest.json`: Product names replaced
- `src/util/common.js`: Company references updated

## Security Best Practices

### Before Committing
1. Run security scan to check for sensitive data
2. Ensure `.env` file is in `.gitignore`
3. Verify no hardcoded credentials or API keys
4. Check for personal information or internal URLs

### Development
1. Use environment variables for all configuration
2. Never hardcode sensitive information
3. Use generic placeholders for company-specific data
4. Regularly update dependencies for security patches

### Deployment
1. Use separate environment files for different environments
2. Secure environment variable storage in production
3. Enable HTTPS in production
4. Implement proper authentication and authorization

## Files to Review Regularly

- All configuration files (*.json)
- Environment variable files
- Build scripts
- Package dependencies
- Localization files (if they contain sensitive references)

## Reporting Security Issues

If you discover any security vulnerabilities or sensitive information that wasn't properly sanitized, please report it immediately to the development team.

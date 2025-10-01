# Contributing to SSPL Website

Thank you for your interest in contributing to the Southern Street Premier League (SSPL) Website! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Documentation](#documentation)

## 🤝 Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors
- Help create a positive community

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Latest stable version
- **Git**: Version 2.25 or higher
- **Supabase Account**: For backend development
- **Razorpay Account**: For payment testing

### Local Development Setup

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/your-username/sspl-website.git
   cd sspl-website
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Supabase Setup**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login and link project
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF

   # Start local Supabase
   supabase start
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 🔄 Development Workflow

### Branching Strategy

We use a Git Flow-inspired branching strategy:

```
main (production)
├── develop (integration)
│   ├── feature/* (new features)
│   ├── bugfix/* (bug fixes)
│   ├── hotfix/* (critical fixes)
│   └── release/* (release preparation)
```

#### Branch Naming Convention

- **Features**: `feature/description-of-feature`
- **Bug Fixes**: `bugfix/issue-description`
- **Hotfixes**: `hotfix/critical-fix-description`
- **Releases**: `release/v1.2.3`

### Development Process

1. **Choose/Create Issue**:
   - Check existing issues on GitHub
   - Create new issue if needed

2. **Create Feature Branch**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

3. **Implement Changes**:
   - Write clean, well-documented code
   - Follow coding standards
   - Add/update tests
   - Update documentation

4. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat: add user registration form"
   ```

5. **Push and Create PR**:
   ```bash
   git push origin feature/your-feature-name
   # Create Pull Request on GitHub
   ```

## 💻 Coding Standards

### TypeScript/JavaScript

- **TypeScript**: Strict mode enabled
- **File Extensions**: `.tsx` for React components, `.ts` for utilities
- **Imports**: Group imports (React, third-party, local)
- **Naming**: PascalCase for components, camelCase for functions/variables

```typescript
// ✅ Good
import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/date';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// ❌ Bad
import * as React from 'react';
import {Button} from "../components/ui/button"
import formatDate from '../../utils/date'
```

### React Components

- **Functional Components**: Preferred over class components
- **Hooks**: Custom hooks for reusable logic
- **Props**: Use TypeScript interfaces for props
- **State**: Use appropriate state management (local vs global)

```tsx
// ✅ Good
interface PlayerCardProps {
  player: Player;
  onSelect?: (player: Player) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onSelect }) => {
  const handleClick = () => {
    onSelect?.(player);
  };

  return (
    <div onClick={handleClick}>
      <h3>{player.name}</h3>
    </div>
  );
};
```

### CSS/Styling

- **Tailwind CSS**: Primary styling approach
- **Custom Classes**: Use meaningful class names
- **Responsive Design**: Mobile-first approach
- **CSS Variables**: For theme customization

```tsx
// ✅ Good
<div className="bg-cricket-blue text-white p-4 rounded-lg shadow-card hover:shadow-float transition-all duration-300">
  <h3 className="text-xl font-bold mb-2">Team Stats</h3>
</div>
```

### File Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form components
│   └── layout/       # Layout components
├── pages/            # Page components
├── hooks/            # Custom hooks
├── services/         # API services
├── types/            # TypeScript definitions
├── utils/            # Utility functions
└── constants/        # Constants and configuration
```

## 🧪 Testing

### Testing Strategy

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API and component interaction testing
- **E2E Tests**: Critical user journey testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Writing Tests

```typescript
// Component Test Example
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerCard } from './PlayerCard';

const mockPlayer = {
  id: '1',
  name: 'John Doe',
  position: 'batsman'
};

test('renders player name', () => {
  render(<PlayerCard player={mockPlayer} />);
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});

test('calls onSelect when clicked', () => {
  const mockOnSelect = jest.fn();
  render(<PlayerCard player={mockPlayer} onSelect={mockOnSelect} />);

  fireEvent.click(screen.getByText('John Doe'));
  expect(mockOnSelect).toHaveBeenCalledWith(mockPlayer);
});
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://conventionalcommits.org/) specification:

### Commit Format
```
type(scope): description

[optional body]

[optional footer]
```

### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Feature commit
git commit -m "feat(auth): add user login functionality"

# Bug fix commit
git commit -m "fix(player-card): resolve display issue on mobile"

# Documentation commit
git commit -m "docs(api): update payment endpoint documentation"

# Breaking change
git commit -m "feat(api): change user registration endpoint

BREAKING CHANGE: The registration endpoint now requires email verification"
```

## 🔄 Pull Request Process

### PR Template

Please use the following template when creating pull requests:

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Notes
Any additional information or context.
```

### PR Review Process

1. **Automated Checks**: CI/CD pipeline runs
2. **Code Review**: At least one reviewer required
3. **Testing**: Reviewer tests the changes
4. **Approval**: Reviewer approves or requests changes
5. **Merge**: Squash merge to maintain clean history

### Review Guidelines

**For Reviewers**:
- Check code quality and adherence to standards
- Verify tests are included and passing
- Test functionality manually
- Ensure documentation is updated
- Consider performance implications

**For Contributors**:
- Address all review comments
- Make requested changes
- Keep PRs focused and atomic
- Update branch with latest changes from develop

## 🐛 Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
**Describe the Bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Version: [e.g., 1.0.0]

**Additional Context**
Add any other context about the problem here.
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions you've considered.

**Additional Context**
Add any other context or screenshots about the feature request here.
```

## 📚 Documentation

### Documentation Standards

- **README.md**: Project overview and quick start
- **TECH_STACK.md**: Technical architecture and setup
- **API_REFERENCE.md**: API documentation
- **DEPLOYMENT_GUIDE.md**: Deployment instructions
- **Inline Comments**: Explain complex logic
- **TypeScript Types**: Self-documenting interfaces

### Updating Documentation

1. **Code Changes**: Update relevant documentation
2. **New Features**: Add feature documentation
3. **API Changes**: Update API reference
4. **Breaking Changes**: Update migration guides

## 🎯 Performance Guidelines

### Frontend Performance
- **Bundle Size**: Keep under 500KB gzipped
- **Core Web Vitals**: Meet Google's standards
- **Image Optimization**: Use WebP format, lazy loading
- **Code Splitting**: Dynamic imports for large components

### Backend Performance
- **Database Queries**: Use indexes, avoid N+1 queries
- **Caching**: Implement appropriate caching strategies
- **Rate Limiting**: Protect against abuse
- **Monitoring**: Track performance metrics

## 🔒 Security Considerations

### Secure Coding Practices
- **Input Validation**: Validate all user inputs
- **Authentication**: Proper session management
- **Authorization**: Role-based access control
- **Data Sanitization**: Prevent XSS attacks
- **Secrets Management**: Never commit secrets

### Security Checklist
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] HTTPS enabled
- [ ] Dependencies updated
- [ ] Security headers configured

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Pull Request Comments**: Code review discussions

### Support Resources
- [Technical Stack Documentation](TECH_STACK.md)
- [API Reference](API_REFERENCE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

---

## 🙏 Recognition

Contributors will be recognized in:
- **README.md**: Contributors section
- **Release Notes**: Credit for contributions
- **Project Documentation**: Acknowledgments

Thank you for contributing to the SSPL Website! 🏏

---

**Last Updated**: 2025-08-31
**Contributing Version**: 1.0.0
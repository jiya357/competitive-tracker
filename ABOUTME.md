# About Me - Developer Information

## Name
Puneet Khatri

## Resume

### Experience
[Your professional experience]

### Skills
- **Frontend**: React, JavaScript/TypeScript, CSS, Vite, responsive design
- **Backend**: Node.js, Express, REST APIs, SQLite
- **AI/ML**: OpenAI API integration, prompt engineering
- **DevOps**: Docker, environment configuration, debugging
- **Tools**: Git, NPM, VS Code

### Education
[Your education details]

### Open Source / Projects
[Links to your portfolio or GitHub projects]

## Contact
- **GitHub**: https://github.com/[your-username]
- **Email**: [your-email@example.com]
- **LinkedIn**: https://linkedin.com/in/[your-profile]

## This Project

**Role**: Full-stack development (frontend + backend + DevOps)

**Time Spent**: ~8 hours total
- Research & planning: 1 hour
- Frontend development: 3 hours
- Backend development: 2.5 hours
- Testing & debugging: 1 hour
- Deployment: 0.5 hour

**Key Contributions**:
1. Architected full-stack application with React frontend and Node.js backend
2. Implemented real-time competitor tracking with change detection
3. Integrated OpenAI API for AI-powered summaries
4. Built responsive UI with custom CSS (no frameworks)
5. Created SQLite database schema and implemented CRUD operations
6. Deployed to production hosting platform
7. Comprehensive documentation and testing

## Approach to This Build

This project challenged me to:
1. **Quickly evaluate AI capabilities** - Determine what GPT-4 could do vs. what needed manual implementation
2. **Make architecture decisions fast** - Choose between frameworks, databases, and hosting quickly
3. **Build with clarity** - Code is intentionally simple and readable, not clever
4. **Document thoroughly** - Clear README for running the app locally and in production
5. **Test manually but systematically** - Covered all major user flows

I chose to use AI for architecture and component structure (where it excels), but manually implemented the core business logic, error handling, and testing (where human judgment is essential).

## Hosting Platform

**Platform**: [Specify: Vercel, Railway, Heroku, AWS, DigitalOcean, etc.]
**URL**: [Live link]
**Database**: SQLite (local file persistence on paid tier)
**Monitoring**: [How you monitor uptime/errors]

### Why This Platform?
- [Your reasoning]
- Good Node.js support
- Easy GitHub integration
- Affordable pricing tier

### Auto-Deployment
- Connected to GitHub repo
- Automatic deploys on push to main branch
- Environment variables configured in platform dashboard

## Open Questions / Known Limitations

1. **Didn't implement**: Scheduled checks (would need background job queue like Bull or node-cron)
2. **Didn't add**: Authentication / multi-user support (could add with Supabase or Auth0)
3. **Didn't include**: Advanced visualizations (could use D3.js or Chart.js)
4. **Potential issue**: SQLite on shared hosting (works, but consider PostgreSQL for better concurrency)

## What I Learned

- OpenAI API is very reliable and integrates smoothly with Node.js
- React with Vite is a productive combination for quick prototyping
- SQLite works great for small-to-medium projects but has concurrency limits
- Writing good error messages is critical for production apps
- Responsive CSS is achievable without frameworks (Grid + Flexbox)

## If I Had More Time

1. Add unit tests (Jest) and integration tests
2. Implement TypeScript for type safety
3. Add rate limiting and authentication
4. Build admin dashboard to see all tracked competitors
5. Add Slack/email notifications for important changes
6. Implement competitor comparison feature
7. Add export to CSV/PDF reports
8. Build Chrome extension for quick link tracking

---

**Last Updated**: February 17, 2026

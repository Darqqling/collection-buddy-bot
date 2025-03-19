
# CollectionBoxBot - Telegram Fundraising Bot

CollectionBoxBot is a Telegram bot designed to automate the collection of funds for gifts within group chats. The system includes a bot interface, server backend, and admin CRM panel for centralized management.

## Project Structure 

- **Telegram Bot**: Interface for users to create and participate in fundraisers
- **Server/API**: Backend for data management and business logic
- **CRM/Admin Panel**: Web interface for administrators to manage the platform

## User Roles and Stories

### Fundraiser Organizer
1. Create new fundraisers (name, amount, deadline, description)
2. Receive status notifications about the fundraiser
3. Manually confirm participant contributions
4. Complete or cancel fundraisers
5. View history of organized fundraisers
6. Manage fundraisers via both group and private chat

### Fundraiser Participant
1. Receive notifications about new fundraisers
2. Join fundraisers (via "Participate" button)
3. Select payment method
4. Receive payment reminders
5. Manually confirm payments
6. Receive notifications about fundraiser completion

### CRM Administrator
1. View all fundraisers
2. Block or delete suspicious fundraisers
3. Manage users (block users)

## Core Use Cases

### Fundraiser Organizer
- Create, configure, launch, complete, and cancel fundraisers
- Manually confirm participant contributions
- Receive fundraiser status and reports

### Fundraiser Participant
- Receive notifications and confirm participation
- Make and confirm payments
- Receive reminders and final reports

### CRM Administrator
- View and manage fundraisers
- Block users and fundraisers

## Implementation Status

### Currently Implemented
- CRM/Admin panel structure
- User management interface
- Fundraiser management interface
- Settings panel for Telegram bot configuration

### In Development
- Telegram bot core functionality
- Webhook integration
- Payment processing

### Planned Features
- Automated payment confirmations
- Analytics dashboard
- Multi-language support

## Technical Implementation

- **Bot Interface**: Telegram Bot API via webhooks
- **Backend**: RESTful API
- **Admin Panel**: React with Tailwind CSS and shadcn/ui
- **Data Storage**: Database (to be determined)

## Monetization Strategy

- **MVP**: Only Telegram Stars donations
- **Future**: Partner integrations, premium features

## Development & Deployment

The application is built with:
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Sequence Diagrams

### Fundraiser Creation Process
```
Organizer -> Bot: Create fundraiser command
Bot -> Organizer: Request fundraiser details
Organizer -> Bot: Provide details
Bot -> API: Save fundraiser data
API -> Bot: Confirm creation
Bot -> Group Chat: Announce new fundraiser
```

### Contribution Process
```
Participant -> Bot: "Participate" button
Bot -> Participant: Payment instructions
Participant -> Bot: "I paid" confirmation
Bot -> Organizer: Payment notification
Organizer -> Bot: Confirm payment
Bot -> Participant: Payment confirmed
Bot -> Group Chat: Update fundraiser status
```


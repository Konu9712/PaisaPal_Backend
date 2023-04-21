# Paisapal Backend

This is a Node.js project that allows users to create groups and track expenses with their friends or family. It is a clone of the popular app Tricount.

## Features

- User authentication with JWT
- Create groups and invite members
- Add expenses and split them between group members
- View the balance sheet of each member in a group
- Edit and delete expenses
- View the transaction history of a group


## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for user authentication
- Nodemon for runtime changes.
- React.js for the frontend (not included in this repository)

## Installation

1. Clone the repository to your local machine.
2. Install the required packages using `npm install`.
3. Rename the `.env.example` file to `.env` and update the environment variables with your own configuration.
4. Start the server using `npm start`.

## API Endpoints

### Category 

- `POST /api/auth/signup`: Create a new user account.
- `POST /api/auth/login`: Authenticate a user and receive a JWT token.

### Authentication

- `POST /api/createCatagory/:groupId`: Create a new Category.
- `POST /api/getCatagory:groupId`: Get all category.

### Groups

- `POST /api/groups`: Create a new group.
- `GET /api/groups/:groupId`: Get details of all groups of user.


### Expenses

- `POST /api/createExpense/:groupId`: Add a new expense to a group.
- `GET /api//getExpense/:groupId`: Get details of a specific expense.
- `PUT /api/updateExpense/:groupId/:expenseId`: Update details of a specific expense.
- `DELETE /api/deleteExpense/:groupId/:expenseId`: Delete a specific expense.

## Future Updates

- Reimbursement amount.
- Payment integration.
- Budget tracking.
- Multi-currency support.

# plantimee
### Semi-automatic event planner

Automatic system can analyze your agenda and agendas of all participants to make predictions 
where and when your event can happen.

### To run project locally:

1. Ensure you have:
    - **node** 14.x.x installed on your computer (you can use nvm to install/switch node version)
    - **yarn** command installed (you can install it using the following command `npm install -g yarn`
    - **psql** command installed on your computer
2. Install all required packages: `yarn` or `yarn install`
3. Create superuser for the local database: `psql -U postgres -c "CREATE USER plantimee_admin SUPERUSER PASSWORD '1111';"`
   - If your OS is Ubuntu you may need to use the following command instead: `sudo -u postnpx sequelize-cli db:creategres psql -c "CREATE USER plantimee_admin SUPERUSER PASSWORD '1111';"`
4. Go to the db folder: `cd db`
5. Create the local database **plantimee**: `npx sequelize-cli db:create`
6. Run all required migrations: `npx sequelize-cli db:migrate`
7. Create `.env.local` file with the following env variable: `REACT_APP_GOOGLE_MAPS_API_KEY`

Finally:
1. Go back to project root: `cd ..`
2. Run the frontend with the `yarn start` command
3. Open second terminal window and run the backend with the `yarn start:backend` command
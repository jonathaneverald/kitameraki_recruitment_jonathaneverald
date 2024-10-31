# How to run this Project

## 1. Clone the repository

```shell
git clone https://github.com/jonathaneverald/kitameraki_recruitment_jonathaneverald.git
```

## 2. Navigate to the Project Directory

```shell
cd <project-directory-name>
```

## 3. Switch to a Specific Branch (Optionally), there is 2 branch: part_one & part_two

```shell
git checkout <branch_name>
```

## 4. Install dependencies

```shell
npm install
```

## 5. Create .env file

### MongoDB connection string

```
DB=mongodb+srv://<username>:<password>@<cluster-address>/<database-name>?retryWrites=true&w=majority&appName=<app-name>
```

Note: You can use your local MongoDB instance or MongoDB Atlas. Replace `<username>`, `<password>`, `<cluster-address>`, `<database-name>`, and `<app-name>` with your specific MongoDB details.

### JWT (JSON Web Token) Secret Key - a unique secret key for signing tokens

```
JWT_SECRET=<your-secret-key>
```

Or you can generate the secret key using src/utils/generate-secret.ts

```
npx ts-node src/utils/generate-secret.ts
```

then copy the Generate Secret into JWT_SECRET

### JWT Expiration Time - specifies how long the token remains valid

```
JWT_EXPIRATION=1d
```

## 6. Run the project

```shell
npm run build
npm run start
```

## 7. Run the project in development mode (Optional)

```shell
npm run dev
```

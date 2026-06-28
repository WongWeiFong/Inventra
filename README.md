# Inventra
A Household Inventory Management App build with React Native, Node.js + Express

## Overview

Inventra is a mobile application designed to help households manage groceries, cooking ingredients, and household supplies.

Users can monitor stock levels, track expiry dates, generate shopping lists, and receive low-stock notifications.

The goal is to reduce food waste, prevent overbuying, and improve household inventory management.

## Objectives

- Track household inventory
- Monitor item expiration dates
- Generate shopping lists
- Reduce food waste
- Improve grocery planning
- Provide meal recommendations

## Features

### Inventory Management

- Add item
- Update quantity
- Delete item
- Search item

### Storage Management

- Refrigerator
- Freezer
- 1st Floor Bathroom
- 1st Floor Cabinet
- 2nd Floor Cabinet

### Expiry Tracking

- Expiry notifications
- Expired item detection

### Shopping List

- Manual list creation
- Auto-generated shopping list

### Recipe Suggestions

- Recommend recipes based on available ingredients

## Architecture

- Mobile app: Expo/React Native in `mobile/`
- API server: Express in `api/server.js`
- Database: Supabase Postgres schema in `database/schema.sql`

## Setup

1. Create the Supabase tables by running `database/schema.sql` in the SQL editor.
2. Run `database/seed.sql` to insert the default categories and storage locations.
3. Create a root `.env` file from `.env.example` with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `PORT`.
4. Start the API server from the repository root with `npm start`.
5. Set `EXPO_PUBLIC_API_URL` in the mobile app environment to the API URL, then start Expo from `mobile/`.

## API Endpoints

- `GET /health`
- `GET /api/categories`
- `GET /api/storage-locations`
- `GET /api/items`
- `GET /api/items/:id`
- `GET /api/items/location/:locationId`
- `GET /api/items/low-stock`
- `GET /api/items/expiring?withinDays=3`
- `GET /api/items/search?q=milk`
- `POST /api/items`
- `PATCH /api/items/:id`
- `DELETE /api/items/:id`
- `GET /api/shopping-list`
- `POST /api/shopping-list`
- `PATCH /api/shopping-list/:id`
- `DELETE /api/shopping-list/:id`
- `DELETE /api/shopping-list/checked`
- `POST /api/shopping-list/generate`


cd mobile
npx expo start
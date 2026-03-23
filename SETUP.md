# FizzPop — Setup & Deployment Guide

## 1. Create a Sanity Project

Open your terminal and run:

```bash
npm create sanity@latest
```

When prompted:
- **Project name**: `fizzpop-store`
- **Use the default dataset configuration?**: Yes (creates `production` dataset)
- **Project template**: Clean project with no predefined schemas
- **Package manager**: npm

This creates a folder called `fizzpop-store` (or whatever you named it).

---

## 2. Create the Product Schema

Inside your Sanity project folder, create the file:

**`fizzpop-store/schemaTypes/product.js`**

```javascript
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
  ],
})
```

Then register it in **`fizzpop-store/schemaTypes/index.js`**:

```javascript
import product from './product'

export const schemaTypes = [product]
```

---

## 3. Start Sanity Studio & Add Products

```bash
cd fizzpop-store
npm run dev
```

Open **http://localhost:3333** in your browser. You will see the Sanity Studio.

1. Click **"Product"** in the sidebar.
2. Click **"Create new"**.
3. Fill in: Name, Price, Image (upload a drink image), Description.
4. Click **"Publish"**.
5. Repeat for as many drinks as you want.

---

## 4. Get Your Sanity Project ID

Your Project ID is shown in your **`fizzpop-store/sanity.config.js`** file:

```javascript
export default defineConfig({
  projectId: 'abc123xy',  // ← This is your Project ID
  dataset: 'production',
  // ...
})
```

You can also find it at [sanity.io/manage](https://www.sanity.io/manage).

---

## 5. Enable CORS for Your Website

Go to [sanity.io/manage](https://www.sanity.io/manage) → select your project → **API** → **CORS origins**.

Add these origins:
- `http://localhost:3000` (for local development)
- `http://localhost:5000` (for local development)
- Your Vercel domain (e.g., `https://fizzpop.vercel.app`) — add this after deploying

Leave **"Allow credentials"** unchecked.

---

## 6. Connect the Website to Sanity

Open **`script.js`** in the Ecom folder and update line 5:

```javascript
const SANITY_PROJECT_ID = 'abc123xy';  // Replace with your actual Project ID
const SANITY_DATASET = 'production';
```

---

## 7. Test Locally

From the `Ecom` folder, run a local server:

```bash
npx -y serve .
```

Open **http://localhost:3000** and verify:
- Products load on the homepage
- Clicking a product shows its details
- "Buy Now" → confirm form → receipt all work

---

## 8. Deploy to Vercel

### Option A: Drag & Drop (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign up / log in.
2. Click **"Add New..."** → **"Project"**.
3. Click **"Upload"** at the bottom of the import page.
4. Drag and drop the entire `Ecom` folder.
5. Click **"Deploy"**.
6. Your site is live! Copy the URL.

### Option B: Vercel CLI

```bash
npm i -g vercel
cd /Users/nathan/Documents/Ecom
vercel
```

Follow the prompts. Your site will be deployed and you'll get a URL.

---

## 9. Add Vercel Domain to Sanity CORS

After deploying, go back to [sanity.io/manage](https://www.sanity.io/manage) → **API** → **CORS origins** and add your Vercel URL (e.g., `https://fizzpop.vercel.app`).

---

## Done!

Your soft drink store is now live. Share the Vercel URL with customers!

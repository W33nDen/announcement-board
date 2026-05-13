import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';

const runtimeProcess = typeof globalThis.process !== 'undefined' ? globalThis.process : undefined;
const app = express();
const prisma = new PrismaClient();
const PORT = runtimeProcess?.env?.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PER_PAGE = 10;
const VALID_CATEGORIES = ['sale', 'service', 'job', 'other'];
const CATEGORY_META = {
  sale: { label: 'Продаж', icon: '📦' },
  service: { label: 'Послуги', icon: '🔧' },
  job: { label: 'Робота', icon: '💼' },
  other: { label: 'Інше', icon: '📌' }
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function formatDate(date) {
  return new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function trimToNull(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function buildQuery(search, sort, page) {
  const params = new URLSearchParams();

  if (search) {
    params.set('search', search);
  }

  if (sort && sort !== 'newest') {
    params.set('sort', sort);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  return params.toString();
}

app.get('/', async (req, res, next) => {
  try {
    const rawSearch = typeof req.query.search === 'string' ? req.query.search : '';
    const search = rawSearch.trim();
    const sort = req.query.sort === 'oldest' ? 'oldest' : 'newest';
    const requestedPage = Number(req.query.page) || 1;

    const where = search
      ? { title: { contains: search } }
      : {};

    const total = await prisma.announcement.count({ where });
    const totalPages = Math.ceil(total / PER_PAGE);
    const currentPage = Math.max(
      1,
      totalPages > 0 ? Math.min(requestedPage, totalPages) : requestedPage
    );
    const skip = (currentPage - 1) * PER_PAGE;
    const orderBy = { createdAt: sort === 'oldest' ? 'asc' : 'desc' };

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy,
      skip,
      take: PER_PAGE
    });

    res.render('index', {
      announcements,
      search,
      sort,
      currentPage,
      totalPages,
      total,
      formatDate,
      categoryMeta: CATEGORY_META,
      buildPageUrl(page) {
        const query = buildQuery(search, sort, page);
        return query ? `/?${query}` : '/';
      }
    });
  } catch (error) {
    next(error);
  }
});

app.get('/announcements', (req, res) => {
  res.render('new', {
    errors: {},
    data: null,
    categoryMeta: CATEGORY_META
  });
});

app.post('/announcements', async (req, res, next) => {
  try {
    const { title, description, price, category, contactInfo } = req.body;
    const errors = {};
    const cleanTitle = trimToNull(title);
    const cleanDescription = trimToNull(description);
    const cleanContactInfo = trimToNull(contactInfo);

    if (!VALID_CATEGORIES.includes(category)) {
      errors.category = 'Оберіть категорію оголошення';
    }

    if (!cleanTitle || cleanTitle.length < 5) {
      errors.title = 'Назва має бути не менше 5 символів';
    } else if (cleanTitle.length > 100) {
      errors.title = 'Назва має бути не більше 100 символів';
    }

    if (!cleanDescription || cleanDescription.length < 10) {
      errors.description = 'Опис має бути не менше 10 символів';
    }

    if (!price || Number.isNaN(Number(price)) || Number(price) <= 0) {
      errors.price = 'Ціна має бути додатним числом';
    }

    if (!cleanContactInfo || cleanContactInfo.length < 5) {
      errors.contactInfo = 'Контактна інформація має бути не менше 5 символів';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).render('new', {
        errors,
        data: req.body,
        categoryMeta: CATEGORY_META
      });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: cleanTitle,
        description: cleanDescription,
        price: Number(price),
        category,
        contactInfo: cleanContactInfo
      }
    });

    res.redirect(`/announcements/${announcement.id}`);
  } catch (error) {
    next(error);
  }
});

app.get('/announcements/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(404).render('404', {
        message: 'Оголошення не знайдено'
      });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!announcement) {
      return res.status(404).render('404', {
        message: 'Оголошення не знайдено'
      });
    }

    res.render('announcement', {
      announcement,
      categoryMeta: CATEGORY_META,
      formatDate
    });
  } catch (error) {
    next(error);
  }
});

app.delete('/announcements/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(404).end();
    }

    await prisma.announcement.delete({
      where: { id }
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).render('404', {
    message: 'Сторінку не знайдено'
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error');
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});

import { Router } from 'express'
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcements.controller.js'
import {
  getAnnouncementsValidator,
  getByIdValidator,
  createAnnouncementValidator,
  updateAnnouncementValidator
} from '../validators/announcements.validators.js'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     Announcement:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - price
 *         - category
 *         - contactInfo
 *       properties:
 *         id:
 *           type: integer
 *           description: Унікальний ідентифікатор оголошення
 *         title:
 *           type: string
 *           description: Назва оголошення (5-100 символів)
 *           example: "Продам ноутбук ASUS"
 *         description:
 *           type: string
 *           description: Детальний опис оголошення (мінімум 10 символів)
 *           example: "Відмінний стан, 16GB RAM, SSD 512GB"
 *         price:
 *           type: number
 *           description: Ціна в гривнях (додатне число)
 *           example: 18000
 *         category:
 *           type: string
 *           enum: [sale, service, job, other]
 *           description: Категорія оголошення
 *           example: "sale"
 *         contactInfo:
 *           type: string
 *           description: Контактна інформація автора (email або телефон)
 *           example: "0991234567"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата створення оголошення
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата останнього оновлення оголошення
 */

/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: Отримання списку оголошень
 *     description: Повертає список оголошень з фільтрацією по назві, сортуванням та пагінацією.
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Пошуковий запит (нечутливий до регістру пошук за назвою)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *         required: false
 *         description: Порядок сортування (за замовчуванням newest)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: Номер сторінки для пагінації (10 оголошень на сторінку)
 *     responses:
 *       200:
 *         description: Успішний запит
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Announcement'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 23
 *                     page:
 *                       type: integer
 *                       example: 2
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     perPage:
 *                       type: integer
 *                       example: 10
 *       400:
 *         description: Невалідні параметри запиту
 */
router.get('/', getAnnouncementsValidator, getAnnouncements)

/**
 * @swagger
 * /announcements/{id}:
 *   get:
 *     summary: Отримання детальної інформації
 *     description: Повертає один повний об'єкт оголошення за його ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Унікальний числовий ID оголошення
 *     responses:
 *       200:
 *         description: Оголошення знайдено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       400:
 *         description: Невалідний формат ID (має бути числом)
 *       404:
 *         description: Оголошення з таким ID не знайдено
 */
router.get('/:id', getByIdValidator, getAnnouncementById)

/**
 * @swagger
 * /announcements:
 *   post:
 *     summary: Створення нового оголошення
 *     description: Отримує дані оголошення, валідує та створює новий запис в базі.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - category
 *               - contactInfo
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *                 example: "Продам ноутбук ASUS"
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 example: "Відмінний стан, 16GB RAM, SSD 512GB"
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 18000
 *               category:
 *                 type: string
 *                 enum: [sale, service, job, other]
 *                 example: "sale"
 *               contactInfo:
 *                 type: string
 *                 minLength: 5
 *                 example: "0991234567"
 *     responses:
 *       201:
 *         description: Успішно створено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       400:
 *         description: Помилка валідації тіла запиту
 */
router.post('/', createAnnouncementValidator, createAnnouncement)

/**
 * @swagger
 * /announcements/{id}:
 *   patch:
 *     summary: Часткове оновлення оголошення
 *     description: Оновлює лише передані поля оголошення за його ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Унікальний числовий ID оголошення
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *                 example: "Нова назва ноутбука"
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 example: "Новий детальний опис для ноутбука"
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 17500
 *               category:
 *                 type: string
 *                 enum: [sale, service, job, other]
 *                 example: "sale"
 *               contactInfo:
 *                 type: string
 *                 minLength: 5
 *                 example: "0997654321"
 *     responses:
 *       200:
 *         description: Оголошення оновлено успішно
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       400:
 *         description: Помилка валідації або порожній об'єкт оновлення
 *       404:
 *         description: Оголошення не знайдено
 */
router.patch('/:id', updateAnnouncementValidator, updateAnnouncement)

/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     summary: Видалення оголошення
 *     description: Видаляє оголошення за його ID та повертає статус 204.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Унікальний числовий ID оголошення
 *     responses:
 *       204:
 *         description: Успішно видалено (тіло відповіді порожнє)
 *       400:
 *         description: Невалідний формат ID
 *       404:
 *         description: Оголошення не знайдено
 */
router.delete('/:id', getByIdValidator, deleteAnnouncement)

export default router

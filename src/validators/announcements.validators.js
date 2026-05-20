import { celebrate, Joi, Segments } from 'celebrate'

// GET /announcements
export const getAnnouncementsValidator = celebrate({
  [Segments.QUERY]: Joi.object().keys({
    search: Joi.string().optional().allow(''),
    sort: Joi.string().valid('newest', 'oldest').optional(),
    page: Joi.number().integer().min(1).optional()
  })
})

// GET /announcements/:id, DELETE /announcements/:id
export const getByIdValidator = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.number().integer().positive().required()
  })
})

// POST /announcements
export const createAnnouncementValidator = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(5).max(100).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().positive().required(),
    category: Joi.string().valid('sale', 'service', 'job', 'other').required(),
    contactInfo: Joi.string().min(5).required()
  })
})

// PATCH /announcements/:id
export const updateAnnouncementValidator = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.number().integer().positive().required()
  }),
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(5).max(100).optional(),
    description: Joi.string().min(10).optional(),
    price: Joi.number().positive().optional(),
    category: Joi.string().valid('sale', 'service', 'job', 'other').optional(),
    contactInfo: Joi.string().min(5).optional()
  }).min(1)
})

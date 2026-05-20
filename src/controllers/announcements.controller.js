import prisma from '../../prisma/client.js'

// GET /announcements
export const getAnnouncements = async (req, res) => {
  const search = req.query.search || ''
  const sort = req.query.sort || 'newest'
  const page = Number(req.query.page) || 1
  const perPage = 10
  const skip = (page - 1) * perPage
  const take = perPage

  const where = {}
  if (search.trim()) {
    where.title = {
      contains: search.trim()
    }
  }

  const orderBy = {
    createdAt: sort === 'oldest' ? 'asc' : 'desc'
  }

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy,
      skip,
      take
    }),
    prisma.announcement.count({ where })
  ])

  const totalPages = Math.ceil(total / perPage)

  res.json({
    data: announcements,
    pagination: {
      total,
      page,
      totalPages,
      perPage
    }
  })
}

// GET /announcements/:id
export const getAnnouncementById = async (req, res) => {
  const id = Number(req.params.id)
  const announcement = await prisma.announcement.findUniqueOrThrow({
    where: { id }
  })
  res.json(announcement)
}

// POST /announcements
export const createAnnouncement = async (req, res) => {
  const { title, description, price, category, contactInfo } = req.body
  const announcement = await prisma.announcement.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      contactInfo: contactInfo.trim()
    }
  })
  res.status(201).json(announcement)
}

// PATCH /announcements/:id
export const updateAnnouncement = async (req, res) => {
  const id = Number(req.params.id)
  
  const data = {}
  const fields = ['title', 'description', 'price', 'category', 'contactInfo']
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      if (typeof req.body[field] === 'string') {
        data[field] = req.body[field].trim()
      } else {
        data[field] = req.body[field]
      }
    }
  }

  const announcement = await prisma.announcement.update({
    where: { id },
    data
  })
  
  res.json(announcement)
}

// DELETE /announcements/:id
export const deleteAnnouncement = async (req, res) => {
  const id = Number(req.params.id)
  await prisma.announcement.delete({
    where: { id }
  })
  res.status(204).end()
}

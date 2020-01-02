//Update all users and set them active
db.users.updateMany({}, { $set: { active: true }})
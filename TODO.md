# TODO - Church Website Admin System Fix

- [x] Fix WeeklyActivitiesAdmin.tsx
  - Add required-field validation (prevent empty submissions)
  - Add loading state, better error parsing
  - Ensure response handling matches backend (data shape)
  - Keep existing GET working



- [ ] Fix SemesterActivitiesAdmin.tsx
  - Add required-field validation
  - Fix form payload mismatch if backend expects title/date_time/venue/description
  - Add loading state + better error parsing

- [ ] Fix axiosInstance.ts
  - Add request/response interceptors with logs (REQUEST/RESPONSE)
  - Ensure Authorization header is always applied when token exists
  - Ensure API base URL is correct for /api/v1
  - Return readable errors

- [ ] Fix AnnouncementsAdmin network error
  - Verify backend endpoint: POST /api/v1/notifications
  - Ensure frontend create uses correct payload keys (posted_to vs posted_To)
  - Add payload validation + error logging

- [ ] Backend: add request body logs for createWeekly/createSemester/createNotification
  - Ensure POST /admin/activities/weekly and POST /admin/activities/semester exist
  - Ensure res.status(201).json(...)

- [ ] Verify route mounting under app.use('/api', apiRoutes)
  - Confirm notifications mounted: api/v1/notifications

- [ ] Final verification steps
  - Add Activity -> save -> reload -> appears
  - Create Announcement -> no Network Error -> appears


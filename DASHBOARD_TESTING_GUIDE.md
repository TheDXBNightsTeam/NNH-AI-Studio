# Dashboard Level 2 - Interactive Testing Guide

**Quick Start:** Run `npm run dev` and navigate to `/dashboard`

---

## 🎯 Quick Visual Testing Guide

### 1. QUICK ACTIONS CARD (Left Column) ⚡

**Test "Reply to Reviews" (💬):**
1. Click the "Reply to Reviews" card
2. ✅ Modal opens showing list of pending reviews
3. Click any review card
4. ✅ Reply form appears with textarea
5. Type a message and click "Send Reply"
6. ✅ Loading spinner → "Reply sent successfully!" toast → Modal closes

**Test "Answer Questions" (❓):**
1. Click the "Answer Questions" card
2. ✅ Modal opens showing unanswered questions
3. Click any question card
4. ✅ Answer form appears
5. Type an answer and click "Post Answer"
6. ✅ Loading → "Answer posted!" toast → Modal closes

**Test "Create New Post" (📝):**
1. Click the "Create New Post" card
2. ✅ Modal opens with form
3. Select post type (What's New, Event, Offer, Product)
4. ✅ Selected button turns orange
5. Fill in title and description
6. Select CTA button and URL
7. Click "Publish"
8. ✅ Loading → "Post published!" toast → Modal closes

---

### 2. WEEKLY TASKS WIDGET (Right Column) ⚡

**Test Task Generation:**
1. Click "Generate Weekly Tasks" button
2. ✅ Button shows spinner: "Generating..."
3. Wait 1 second
4. ✅ 3-5 tasks appear with checkboxes
5. ✅ Progress shows "0/X completed"
6. ✅ Toast: "Weekly tasks generated!"

**Test Task Completion:**
1. Click a task checkbox
2. ✅ Text gets strikethrough animation
3. ✅ Progress updates: "1/X completed"
4. ✅ Micro-toast: "Task completed!"
5. Refresh the page (F5)
6. ✅ Tasks persist (localStorage)

---

### 3. ACTIVE LOCATION CARD (Left Column) 📍

**Test Sync:**
1. Click "Sync Now" button
2. ✅ Button shows: "⏳ Syncing..."
3. Wait 1 second
4. ✅ Toast: "Location synced successfully!"
5. ✅ "Last Updated" timestamp changes

**Test Disconnect:**
1. Click "Disconnect" button
2. ✅ Confirmation modal appears
3. ✅ Warning icon and message shown
4. Click "Disconnect" (red button)
5. ✅ Loading → Toast: "Location disconnected"

**Test Navigation:**
1. Click "Go to Location →" button
2. ✅ Navigates to location details page

---

### 4. PROFILE PROTECTION CARD (Right Column) 🛡️

**Test Protection Modal:**
1. Click "Manage Protection" button
2. ✅ Modal opens showing:
   - Protection score (0%)
   - Progress bar
   - List of issues with ⚠️ icons
   - Three recommendation buttons
3. Click "Complete GMB Profile"
4. ✅ Navigates to /features
5. Return and test other buttons (Upload Photos → /media, Create Post → /posts)

---

### 5. RECOMMENDED QUICK WINS (Right Column) 🎯

**Test All Three Cards:**
1. Hover over "Complete GMB Profile"
2. ✅ Card scales up slightly, border turns orange
3. Click the card
4. ✅ Navigates to /features
5. Repeat for:
   - "Upload 5 New Photos" → /media
   - "Create a GMB Post" → /posts

---

### 6. AI RISK & OPPORTUNITY FEED (Bottom Left) 🎯

**Test Expandable Items:**
1. Find the three alert items (HIGH/MEDIUM priority)
2. Click on first alert
3. ✅ Item expands, showing:
   - Detailed description
   - "Take Action" button
   - Chevron icon changes (up/down)
4. Click "Take Action"
5. ✅ Navigates to relevant page (/reviews or /questions)
6. Return and test other alerts
7. Click same alert again
8. ✅ Collapses back

---

### 7. AI INSIGHTS CARDS (Bottom Right) 💡

**Test All Insight Cards:**
1. Hover over any insight card
2. ✅ Card brightens slightly and scales up
3. Click "Rating Trending Up" (green)
4. ✅ Navigates to /reviews
5. Return and test others:
   - "Improve Response Rate" → /reviews
   - "Questions Need Answers" → /questions
   - "Health Score Low" → /locations

---

### 8. LOCATION HIGHLIGHTS (Bottom Left) 📍

**Test View Details:**
1. Find "Top Performer" section
2. Click "View Details →" button at bottom
3. ✅ Navigates to location details page

---

### 9. HEADER ACTIONS (Top Right) 🔄

**Test Refresh:**
1. Click "Refresh Now" button
2. ✅ Spinner appears on button
3. ✅ Toast: "Dashboard refreshed!"
4. ✅ "Last Updated" shows "Just now"

**Test Time Filters:**
1. Click "Last 7 Days"
2. ✅ Button turns orange (active state)
3. Click "Last 90 Days"
4. ✅ Button turns orange, previous deactivates
5. Click "Custom"
6. ✅ Date picker appears below
7. Select start and end dates
8. Click "Apply"
9. ✅ Toast: "Custom date range applied"
10. ✅ Date picker closes
11. Click "Reset"
12. ✅ Returns to default (Last 30 Days)

---

### 10. PERFORMANCE CHART (Bottom Left) 📊

**Test Chart Interactions:**
1. Hover over the line chart
2. ✅ Tooltip appears showing exact values
3. ✅ Tooltip has dark theme styling
4. Move mouse along the chart
5. ✅ Tooltip follows and updates values
6. Check legend colors match lines:
   - ✅ Blue line = Reviews
   - ✅ Yellow line = Avg Rating

---

## 🎨 VISUAL QUALITY CHECKS

### Hover States (Test on ALL clickable elements)
- ✅ Cursor changes to pointer
- ✅ Element scales up or brightens
- ✅ Border color changes to orange
- ✅ Smooth transition (not jumpy)

### Loading States
- ✅ Buttons show spinner during loading
- ✅ Text changes to "Loading..." or "Processing..."
- ✅ Button is disabled (can't double-click)
- ✅ Spinner animates smoothly

### Toast Notifications
- ✅ Appear in top-right corner
- ✅ Have close button (X)
- ✅ Auto-dismiss after ~3 seconds
- ✅ Success toasts are green
- ✅ Error toasts are red (test by submitting empty form)

### Modal Behavior
- ✅ Opens with smooth animation
- ✅ Has dark overlay (backdrop)
- ✅ Clicking backdrop closes modal
- ✅ Clicking X button closes modal
- ✅ Cancel button closes modal
- ✅ Submit action closes modal after success
- ✅ Scrollable if content is long

---

## 📱 MOBILE RESPONSIVENESS TEST

**Resize browser to mobile width (375px):**

1. ✅ All modals fit screen width
2. ✅ Buttons stack vertically when needed
3. ✅ Text remains readable
4. ✅ Touch targets are large enough
5. ✅ Scrolling works smoothly
6. ✅ No horizontal overflow
7. ✅ Time filters wrap to multiple rows

---

## 🐛 COMMON ISSUES TO CHECK

### If Modal Won't Open:
- Check browser console for errors
- Verify 'use client' directive is present
- Check state management (useState initialized)

### If Toast Doesn't Appear:
- Verify Sonner is imported in layout
- Check toast() function is called
- Inspect for z-index conflicts

### If Navigation Doesn't Work:
- Verify useRouter is from 'next/navigation' (not 'next/router')
- Check route exists in app directory
- Test with hard-coded console.log first

### If LocalStorage Doesn't Persist:
- Check browser allows localStorage
- Verify STORAGE_KEY is unique
- Check JSON.parse/stringify is correct

---

## ✅ COMPLETE TEST CHECKLIST

Copy this list and check off as you test:

**Quick Actions:**
- [ ] Reply to Reviews modal opens
- [ ] Reply form works
- [ ] Reply sends successfully
- [ ] Answer Questions modal opens
- [ ] Answer form works
- [ ] Answer posts successfully
- [ ] Create Post modal opens
- [ ] Post type selection works
- [ ] Form submission works

**Weekly Tasks:**
- [ ] Generate button works
- [ ] Tasks appear with checkboxes
- [ ] Checkbox toggle works
- [ ] Strikethrough animation works
- [ ] Progress updates
- [ ] LocalStorage persists tasks

**Active Location:**
- [ ] Sync Now works
- [ ] Disconnect modal appears
- [ ] Disconnect confirms
- [ ] Go to Location navigates

**Navigation:**
- [ ] All Quick Wins navigate
- [ ] Profile Protection navigates
- [ ] Feed items navigate
- [ ] AI Insights navigate
- [ ] View Details navigates

**Header:**
- [ ] Refresh Now works
- [ ] Time filters work
- [ ] Custom date picker works
- [ ] Reset works

**Visual:**
- [ ] All hover effects work
- [ ] All loading states work
- [ ] All toasts appear
- [ ] All modals close properly
- [ ] Mobile responsive works

---

## 🎉 SUCCESS!

If all tests pass, you've successfully verified that the NNH Dashboard is now a fully interactive control center!

**The dashboard has been transformed from a beautiful corpse to a living, breathing application! 🚀**

---

**Next Steps:**
1. Show to stakeholders for feedback
2. Plan Phase 3 (Real API integration)
3. Prepare for production deployment


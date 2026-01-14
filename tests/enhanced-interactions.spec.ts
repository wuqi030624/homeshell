import { test, expect } from '@playwright/test';

test.describe('Enhanced Mouse Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Clear any existing todos
    await page.evaluate(() => {
      localStorage.clear();
      location.reload();
    });
    await page.waitForLoadState('networkidle');
  });

  test('should create todo with tags', async ({ page }) => {
    const input = page.locator('.main-input input');
    
    // Create todo with tags
    await input.fill('学习Vue #前端 #Vue3');
    await input.press('Enter');
    
    // Verify todo created
    const todoItem = page.locator('.todo-item').first();
    await expect(todoItem).toBeVisible();
    await expect(todoItem.locator('.content')).toContainText('学习Vue');
    
    // Verify tags displayed
    const tags = todoItem.locator('.tag-pill');
    await expect(tags).toHaveCount(2);
    await expect(tags.first()).toContainText('前端');
    await expect(tags.last()).toContainText('Vue3');
  });

  test('should create todo with priority', async ({ page }) => {
    const input = page.locator('.main-input input');
    
    await input.fill('重要任务 !');
    await input.press('Enter');
    
    const todoItem = page.locator('.todo-item').first();
    await expect(todoItem).toBeVisible();
    await expect(todoItem.locator('.priority-button.is-important')).toBeVisible();
    await expect(todoItem.locator('.priority-button')).toContainText('!');
  });

  test('should select todo on click', async ({ page }) => {
    // Create a todo first
    const input = page.locator('.main-input input');
    await input.fill('测试任务');
    await input.press('Enter');
    
    const todoItem = page.locator('.todo-item').first();
    await todoItem.click();
    
    // Verify selected state
    await expect(todoItem.locator('.todo-wrapper')).toHaveClass(/is-selected/);
  });

  test('should cycle status on status button click', async ({ page }) => {
    // Create a todo
    const input = page.locator('.main-input input');
    await input.fill('测试状态切换');
    await input.press('Enter');
    
    const todoItem = page.locator('.todo-item').first();
    const statusButton = todoItem.locator('.status-button');
    
    // Initial state: TODO (empty circle)
    await expect(statusButton).toBeVisible();
    await expect(statusButton).not.toHaveClass(/is-doing/);
    await expect(statusButton).not.toHaveClass(/is-done/);
    
    // Click to DOING
    await statusButton.click();
    await expect(statusButton).toHaveClass(/is-doing/);
    await expect(todoItem).toHaveClass(/is-doing/);
    
    // Click to DONE
    await statusButton.click();
    await expect(statusButton).toHaveClass(/is-done/);
    await expect(todoItem).toHaveClass(/is-done/);
    
    // Click to TODO (cycle)
    await statusButton.click();
    await expect(statusButton).not.toHaveClass(/is-doing/);
    await expect(statusButton).not.toHaveClass(/is-done/);
  });

  test('should toggle priority on priority button click', async ({ page }) => {
    const input = page.locator('.main-input input');
    await input.fill('任务 !');
    await input.press('Enter');
    
    const todoItem = page.locator('.todo-item').first();
    await todoItem.click(); // Select to show priority button
    
    const priorityButton = todoItem.locator('.priority-button');
    await expect(priorityButton).toHaveClass(/is-important/);
    
    // Toggle to default
    await priorityButton.click();
    await expect(priorityButton).not.toHaveClass(/is-important/);
    
    // Toggle back to important
    await priorityButton.click();
    await expect(priorityButton).toHaveClass(/is-important/);
  });

  test('should enter edit mode on double-click', async ({ page }) => {
    const input = page.locator('.main-input input');
    await input.fill('可编辑任务');
    await input.press('Enter');
    
    const todoItem = page.locator('.todo-item').first();
    const content = todoItem.locator('.content');
    
    // Double-click to edit
    await content.dblclick();
    
    // Verify edit mode active
    await expect(todoItem).toHaveClass(/is-editing/);
    
    const editInput = todoItem.locator('.edit-input');
    await expect(editInput).toBeVisible();
    await expect(editInput).toBeFocused();
  });

  test('should show action buttons on hover', async ({ page }) => {
    const input = page.locator('.main-input input');
    await input.fill('测试悬停');
    await input.press('Enter');
    
    const todoItem = page.locator('.todo-item').first();
    
    // Hover over todo
    await todoItem.hover();
    
    // Verify action buttons appear
    const actions = todoItem.locator('.actions');
    await expect(actions).toBeVisible();
    
    // Should have start button for TODO status
    await expect(actions.locator('.action-btn.start')).toBeVisible();
    await expect(actions.locator('.action-btn.edit')).toBeVisible();
  });

  test('should show drag handle on hover', async ({ page }) => {
    const input = page.locator('.main-input input');
    await input.fill('可拖拽任务');
    await input.press('Enter');
    
    const todoItem = page.locator('.todo-item').first();
    await todoItem.hover();
    
    const dragHandle = todoItem.locator('.drag-handle');
    await expect(dragHandle).toBeVisible();
    await expect(dragHandle).toHaveAttribute('draggable', 'true');
  });

  test('should clear selection on click outside', async ({ page }) => {
    // Create and select a todo
    const input = page.locator('.main-input input');
    await input.fill('测试点击外部');
    await input.press('Enter');
    
    const todoItem = page.locator('.todo-item').first();
    await todoItem.click();
    await expect(todoItem.locator('.todo-wrapper')).toHaveClass(/is-selected/);
    
    // Click outside (on body)
    await page.locator('.dashboard-container').click({ position: { x: 10, y: 10 } });
    
    // Verify selection cleared
    await expect(todoItem.locator('.todo-wrapper')).not.toHaveClass(/is-selected/);
  });

  test('should add note when todo is selected', async ({ page }) => {
    const input = page.locator('.main-input input');
    
    // Create and select todo
    await input.fill('主任务');
    await input.press('Enter');
    
    const todoItem = page.locator('.todo-item').first();
    await todoItem.click();
    
    // Add note
    await input.fill('这是一条便签');
    await input.press('Enter');
    
    // Verify note created
    const notesSection = page.locator('.notes-section');
    await expect(notesSection).toBeVisible();
    
    const noteItem = page.locator('.note-item').first();
    await expect(noteItem).toBeVisible();
    await expect(noteItem).toContainText('这是一条便签');
  });

  test('should switch search engines on Tab in search mode', async ({ page }) => {
    const input = page.locator('.main-input input');
    
    // Enter search mode
    await input.press('Tab');
    
    const placeholder1 = await input.getAttribute('placeholder');
    
    // Tab to cycle
    await input.press('Tab');
    
    const placeholder2 = await input.getAttribute('placeholder');
    
    // Verify placeholder changed (different search engine)
    expect(placeholder1).not.toBe(placeholder2);
  });

  test('should execute keyboard commands', async ({ page }) => {
    const input = page.locator('.main-input input');
    
    // Create two todos
    await input.fill('任务1');
    await input.press('Enter');
    await input.fill('任务2');
    await input.press('Enter');
    
    // Select first todo with /1 command
    await input.fill('/1');
    await input.press('Enter');
    
    const firstTodo = page.locator('.todo-item').first();
    await expect(firstTodo.locator('.todo-wrapper')).toHaveClass(/is-selected/);
    
    // Start with s command
    await input.fill('s');
    await input.press('Enter');
    await expect(firstTodo).toHaveClass(/is-doing/);
    
    // Complete with d command
    await input.fill('d');
    await input.press('Enter');
    await expect(firstTodo).toHaveClass(/is-done/);
  });

  test('should display notes count badge', async ({ page }) => {
    const input = page.locator('.main-input input');
    
    // Create todo and add notes
    await input.fill('主任务');
    await input.press('Enter');
    
    const todoItem = page.locator('.todo-item').first();
    await todoItem.click();
    
    // Add multiple notes
    await input.fill('便签1');
    await input.press('Enter');
    await input.fill('便签2');
    await input.press('Enter');
    await input.fill('便签3');
    await input.press('Enter');
    
    // Verify notes badge shows count
    const notesBadge = todoItem.locator('.notes-badge');
    await expect(notesBadge).toBeVisible();
    await expect(notesBadge).toContainText('3');
  });
});

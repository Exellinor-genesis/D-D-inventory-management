const tabMenu = document.getElementById('tab-menu');
const toggleTabMenu = document.getElementById('toggle-tab-menu');
const addTabButton = document.getElementById('add-tab');
const tabNameInput = document.getElementById('tab-name');
const tabDescriptionInput = document.getElementById('tab-description');
const portraitPlaceholder = document.getElementById('portrait-placeholder');
const portraitFileInput = document.getElementById('portrait-file');
const inventoryGrid = document.getElementById('inventory-grid');
const inventoryPanel = document.getElementById('inventory-panel');
const itemLibrary = document.getElementById('item-library');
const itemNameInput = document.getElementById('item-name');
const itemImageFileInput = document.getElementById('item-image-file');
const addItemButton = document.getElementById('add-item');
const autoAddImageCheckbox = document.getElementById('auto-add-image');
const portraitMoneyBadge = document.getElementById('portrait-money-badge');
const itemForm = document.getElementById('item-form');
const itemList = document.getElementById('item-list');
const commandInput = document.getElementById('command-input');
const runCommandButton = document.getElementById('run-command');
const commandOutput = document.getElementById('command-output');
const healthText = document.getElementById('health-text');
const healthFill = document.getElementById('health-fill');
const statusEffectsList = document.getElementById('status-effects-list');
const itemMenu = document.getElementById('item-menu');
const itemAddBtn = document.getElementById('item-add-btn');
const itemRemoveBtn = document.getElementById('item-remove-btn');
const itemDeleteBtn = document.getElementById('item-delete-btn');
const showCommandsBtn = document.getElementById('show-commands-btn');
const commandHelp = document.getElementById('command-help');
const libraryButtonHeader = document.getElementById('library-button-header');

// Local storage keys
const STORAGE_KEYS = {
  TABS: 'dnd-inventory-tabs',
  ITEMS: 'dnd-inventory-items',
};

// Application state
let tabs = [];
let itemLibraryEntries = [];
let activeTabId = null;
let tabMenuOpen = false;
let draggedItem = null;
let draggedLibraryIndex = null;
let currentItemName = null;
let currentSlotIndex = null;

// Data loading and persistence
// Load data from localStorage or use defaults
function loadData() {
  const savedTabs = localStorage.getItem(STORAGE_KEYS.TABS);
  const savedItems = localStorage.getItem(STORAGE_KEYS.ITEMS);

  if (savedTabs) {
    tabs = JSON.parse(savedTabs);
    activeTabId = tabs[0]?.id || null;
    // Ensure all tabs have money, health, and maxHealth
    tabs.forEach(tab => {
      if (!('money' in tab)) tab.money = 0;
      if (!('health' in tab)) tab.health = 100;
      if (!('maxHealth' in tab)) tab.maxHealth = 100;
      if (!('statusEffects' in tab)) tab.statusEffects = [];
      if (tab.health > tab.maxHealth) tab.health = tab.maxHealth;
    });
  } else {
    tabs = [
      {
        id: 'tab-1',
        name: 'Example',
        description: 'This is an example inventory tab. You can edit or delete it, and create new tabs for different characters. Click the portrait area to upload an image for your character, and use the command input to quickly add items or adjust stats. Try commands like `add Potion 3`, `damage 10`, or `status Poisoned image Potion`.',
        portrait: '',
        money: 15,
        health: 100,
        maxHealth: 100,
        items: Array.from({ length: 35 }, (_, index) => ({ id: `slot-${index + 1}`, slotIndex: index, items: [] })),
      },
    ];
    activeTabId = tabs[0].id;
    saveData();
  }

  if (savedItems) {
    itemLibraryEntries = JSON.parse(savedItems);
  } else {
    itemLibraryEntries = [
      { name: 'Potion', image: 'https://img.pikbest.com/png-images/20250121/3d-clear-glass-potion-bottle-with-red-liquid-on-transparent-background-_11428242.png!sw800' },
      { name: 'Sword', image: 'https://www.freeiconspng.com/thumbs/sword-png/sword-png-1.png' },
    ];
    saveData();
  }
}

// Save data to localStorage
function saveData() {
  localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs));
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(itemLibraryEntries));
}

// Drag and drop handlers
function handleDragStart(e) {
  const slot = e.currentTarget;
  const slotIndex = parseInt(slot.dataset.slotIndex);
  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (!activeTab || !activeTab.items[slotIndex].items.length) {
    e.preventDefault();
    return;
  }

  draggedItem = {
    tabId: activeTabId,
    slotIndex: slotIndex,
    item: activeTab.items[slotIndex].items[0],
  };

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', JSON.stringify(draggedItem));
  slot.style.opacity = '0.5';
}

function handleDragOver(e) {
  if (!draggedItem) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.style.backgroundColor = 'rgba(125, 95, 255, 0.3)';
}

function handleDragLeave(e) {
  e.currentTarget.style.backgroundColor = '';
}

function handleDragEnd(e) {
  e.currentTarget.style.opacity = '1';
  document.querySelectorAll('.grid-cell').forEach((cell) => {
    cell.style.backgroundColor = '';
  });
}

function handleDrop(e) {
  e.preventDefault();
  if (!draggedItem) return;

  const targetSlot = e.currentTarget;
  const targetSlotIndex = parseInt(targetSlot.dataset.slotIndex);
  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (!activeTab) return;

  const sourceSlot = activeTab.items[draggedItem.slotIndex];
  const targetSlotObj = activeTab.items[targetSlotIndex];

  if (draggedItem.tabId === activeTabId) {
    // Same tab move
    if (draggedItem.slotIndex === targetSlotIndex) {
      draggedItem = null;
      return;
    }

    // Swap or move logic
    if (targetSlotObj.items.length === 0) {
      targetSlotObj.items = sourceSlot.items;
      sourceSlot.items = [];
    } else if (targetSlotObj.items[0].name === draggedItem.item.name) {
      // Same item type - increment quantity
      targetSlotObj.items[0].quantity += draggedItem.item.quantity;
      sourceSlot.items = [];
    } else {
      // Swap
      const temp = sourceSlot.items;
      sourceSlot.items = targetSlotObj.items;
      targetSlotObj.items = temp;
    }

    saveData();
    renderInventoryGrid(activeTab.items);
  }

  draggedItem = null;
  targetSlot.style.backgroundColor = '';
}

function handleLibraryDragStart(e) {
  const card = e.currentTarget;
  draggedLibraryIndex = Number(card.dataset.index);
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', String(draggedLibraryIndex));
  card.classList.add('dragging');
}

function handleLibraryDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleLibraryDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleLibraryDrop(e) {
  e.preventDefault();
  const targetIndex = Number(e.currentTarget.dataset.index);
  if (draggedLibraryIndex === null || targetIndex === draggedLibraryIndex) {
    draggedLibraryIndex = null;
    e.currentTarget.classList.remove('drag-over');
    return;
  }

  const [movedItem] = itemLibraryEntries.splice(draggedLibraryIndex, 1);
  itemLibraryEntries.splice(targetIndex, 0, movedItem);
  saveData();
  renderItemLibrary();
  draggedLibraryIndex = null;
}

function handleLibraryDragEnd() {
  document.querySelectorAll('.item-card').forEach((card) => {
    card.classList.remove('drag-over', 'dragging');
  });
  draggedLibraryIndex = null;
}

// Library helpers
function addLibraryItemFromFile(file) {
  const name = itemNameInput.value.trim() || file.name.replace(/\.[^/.]+$/, '');
  const reader = new FileReader();
  reader.onload = (e) => {
    const image = e.target.result;
    itemLibraryEntries.push({ name, image });
    saveData();
    renderItemLibrary();
    itemNameInput.value = '';
    itemImageFileInput.value = '';
  };
  reader.readAsDataURL(file);
}

// UI rendering
function renderTabButtons() {
  tabMenu.innerHTML = '';
  tabMenu.innerHTML = '';
  tabs.forEach((tab) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'tab-item';

    const button = document.createElement('button');
    button.className = 'tab-button' + (tab.id === activeTabId ? ' active' : '');
    button.textContent = tab.name;
    button.addEventListener('click', () => selectTab(tab.id));

    const deleteButton = document.createElement('button');
    deleteButton.className = 'tab-delete';
    deleteButton.textContent = '×';
    deleteButton.title = 'Delete tab';
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteTab(tab.id);
    });

    wrapper.appendChild(button);
    wrapper.appendChild(deleteButton);
    tabMenu.appendChild(wrapper);
  });
}

function selectTab(tabId) {
  activeTabId = tabId;
  renderTabButtons();

  if (tabId === 'item-library') {
    inventoryPanel.classList.add('hidden');
    document.getElementById("testing").classList.add('hidden');
    inventoryPanel.style.display = 'none';
    itemLibrary.classList.remove('hidden');
    itemLibrary.style.display = 'block';
    document.querySelector('.header-title h1').textContent = 'D&D Item Library';
  } else {
    inventoryPanel.classList.remove('hidden');
    document.getElementById("testing").classList.remove('hidden');
    inventoryPanel.style.display = '';
    itemLibrary.classList.add('hidden');
    itemLibrary.style.display = '';
    const activeTab = tabs.find((t) => t.id === tabId);
    document.querySelector('.header-title h1').textContent = activeTab ? `${activeTab.name} Inventory` : 'D&D Inventory Manager';
    tabNameInput.value = activeTab.name;
    tabDescriptionInput.value = activeTab.description;
    portraitMoneyBadge.querySelector('strong').textContent = activeTab.money;
    updateHealthDisplay(activeTab.health, activeTab.maxHealth);
    portraitPlaceholder.style.backgroundImage = activeTab.portrait ? `url('${activeTab.portrait}')` : '';
    portraitPlaceholder.textContent = activeTab.portrait ? '' : 'Click to select an image';
    renderStatusEffects(activeTab.statusEffects);
    renderInventoryGrid(activeTab.items);
  }
}

function updateHealthDisplay(health, maxHealth) {
  if (!healthText || !healthFill) return;
  const safeMax = Math.max(1, maxHealth);
  const ratio = Math.min(Math.max(health / safeMax, 0), 1);
  healthText.textContent = `${health}/${maxHealth}`;
  healthFill.style.width = `${ratio * 100}%`;

  const hue = Math.round(120 * ratio); // 0 = red, 120 = green
  const fillColor = `hsl(${hue}, 85%, 55%)`;
  const glowColor = `hsla(${hue}, 85%, 60%, 0.35)`;

  healthFill.style.backgroundColor = fillColor;
  healthFill.style.boxShadow = `0 0 16px ${glowColor}`;
}

function renderStatusEffects(statusEffects) {
  statusEffectsList.innerHTML = '';
  statusEffects.forEach(effect => {
    const effectDiv = document.createElement('div');
    effectDiv.className = 'status-effect';
    if (effect.image) {
      const img = document.createElement('img');
      img.src = effect.image;
      img.alt = effect.name;
      effectDiv.appendChild(img);
    } else {
      effectDiv.textContent = '•';
    }
    const nameSpan = document.createElement('span');
    nameSpan.textContent = effect.name;
    effectDiv.appendChild(nameSpan);
    statusEffectsList.appendChild(effectDiv);
  });
}

function renderInventoryGrid(slots) {
  inventoryGrid.innerHTML = '';
  slots.forEach((slot, index) => {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.id = `slot-${index}`;
    cell.draggable = true;
    cell.dataset.slotIndex = index;

    if (slot.items && slot.items.length > 0) {
      const firstItem = slot.items[0];
      cell.style.backgroundImage = firstItem.image ? `url('${firstItem.image}')` : '';
      cell.style.backgroundSize = 'contain';
      cell.style.backgroundPosition = 'center';
      cell.style.backgroundRepeat = 'no-repeat';

      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        background: transparent;
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        color: white;
        font-weight: bold;
        padding: 8px 6px 10px;
        cursor: move;
        pointer-events: none;
      `;

      const nameDiv = document.createElement('div');
      nameDiv.style.cssText = 'font-size: 0.85rem; text-align: center; overflow: hidden; text-overflow: ellipsis; width: 100%; color: black; text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white, 0 0 2px white;';
      nameDiv.textContent = firstItem.name;
      overlay.appendChild(nameDiv);

      const qtyDiv = document.createElement('div');
      qtyDiv.style.cssText = 'position: absolute; top: 6px; right: 6px; font-size: 1.1rem; font-weight: 900; color: black; text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white; pointer-events: none;';
      qtyDiv.textContent = firstItem.quantity > 1 ? `×${firstItem.quantity}` : '';

      cell.appendChild(overlay);
      cell.appendChild(qtyDiv);
    } else {
      cell.textContent = '';
      cell.style.backgroundImage = '';
    }

    // Drag events
    cell.addEventListener('dragstart', handleDragStart);
    cell.addEventListener('dragover', handleDragOver);
    cell.addEventListener('drop', handleDrop);
    cell.addEventListener('dragleave', handleDragLeave);
    cell.addEventListener('dragend', handleDragEnd);

    // Click to show menu
    if (slot.items && slot.items.length > 0) {
      cell.addEventListener('click', (e) => {
        currentSlotIndex = index;
        currentItemName = slot.items[0].name;
        itemMenu.classList.remove('hidden');
        const rect = cell.getBoundingClientRect();
        itemMenu.style.position = 'absolute';
        itemMenu.style.top = `${rect.bottom + window.scrollY + 4}px`;
        itemMenu.style.left = `${rect.left + window.scrollX}px`;
        itemMenu.style.zIndex = '1000';
      });
    }

    inventoryGrid.appendChild(cell);
  });
}

function hideItemMenu() {
  itemMenu.classList.add('hidden');
  currentSlotIndex = null;
  currentItemName = null;
}

function adjustInventorySlotQuantity(delta) {
  const activeTab = tabs.find((t) => t.id === activeTabId);
  if (!activeTab || currentSlotIndex === null) return;
  const slot = activeTab.items[currentSlotIndex];
  if (!slot.items.length) return;
  slot.items[0].quantity += delta;
  if (slot.items[0].quantity <= 0) {
    slot.items = [];
  }
  saveData();
  renderInventoryGrid(activeTab.items);
  hideItemMenu();
}

function removeInventorySlotItem() {
  const activeTab = tabs.find((t) => t.id === activeTabId);
  if (!activeTab || currentSlotIndex === null) return;
  activeTab.items[currentSlotIndex].items = [];
  saveData();
  renderInventoryGrid(activeTab.items);
  hideItemMenu();
}

function renderItemLibrary() {
  itemList.innerHTML = '';
  itemLibraryEntries.forEach((entry, index) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.draggable = true;
    card.dataset.index = index;

    const image = document.createElement('img');
    image.src = entry.image;
    image.alt = entry.name;
    card.appendChild(image);

    const details = document.createElement('div');
    details.className = 'item-details';

    const label = document.createElement('div');
    label.className = 'item-label';
    label.textContent = entry.name;
    details.appendChild(label);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'item-delete-btn';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteLibraryItem(index);
    });
    details.appendChild(deleteButton);

    card.appendChild(details);
    card.addEventListener('dragstart', handleLibraryDragStart);
    card.addEventListener('dragover', handleLibraryDragOver);
    card.addEventListener('dragleave', handleLibraryDragLeave);
    card.addEventListener('drop', handleLibraryDrop);
    card.addEventListener('dragend', handleLibraryDragEnd);
    itemList.appendChild(card);
  });
}

function deleteTab(tabId) {
  if (tabs.length <= 1) {
    commandOutput.textContent = 'You must keep at least one inventory tab.';
    return;
  }
  const tabIndex = tabs.findIndex((tab) => tab.id === tabId);
  if (tabIndex === -1) return;

  tabs.splice(tabIndex, 1);
  if (activeTabId === tabId) {
    activeTabId = tabs[0].id;
  }
  saveData();
  renderTabButtons();
  selectTab(activeTabId);
}

function deleteLibraryItem(index) {
  itemLibraryEntries.splice(index, 1);
  saveData();
  renderItemLibrary();
}

function addTab() {
  const newTabId = `tab-${Date.now()}`;
  tabs.push({
    id: newTabId,
    name: `New Tab ${tabs.length + 1}`,
    description: 'A fresh inventory screen.',
    portrait: '',
    money: 0,
    health: 100,
    maxHealth: 100,
    statusEffects: [],
    items: Array.from({ length: 35 }, (_, index) => ({ id: `slot-${index + 1}`, slotIndex: index, items: [] })),
  });
  saveData();
  renderTabButtons();
  selectTab(newTabId);
}

function updateActiveTabMeta() {
  if (activeTabId === 'item-library') return;
  const activeTab = tabs.find((t) => t.id === activeTabId);
  if (!activeTab) return;
  activeTab.name = tabNameInput.value || 'Unnamed Tab';
  activeTab.description = tabDescriptionInput.value;
  saveData();
}

function handlePortraitFileUpdate() {
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const file = portraitFileInput.files[0];
  if (!activeTab || !file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    activeTab.portrait = event.target.result;
    portraitPlaceholder.style.backgroundImage = `url('${activeTab.portrait}')`;
    portraitPlaceholder.textContent = '';
    portraitFileInput.value = '';
    saveData();
  };
  reader.readAsDataURL(file);
}

function handlePortraitPlaceholderClick() {
  portraitFileInput.click();
}

function addItemToInventory(itemName, quantity = 1) {
  const activeTab = tabs.find((t) => t.id === activeTabId);
  if (!activeTab) return false;

  const libraryItem = itemLibraryEntries.find((i) => i.name.toLowerCase() === itemName.toLowerCase());
  if (!libraryItem) {
    return false;
  }

  // Find first empty slot or slot with same item
  for (let slot of activeTab.items) {
    if (slot.items.length === 0) {
      slot.items.push({ name: libraryItem.name, image: libraryItem.image, quantity });
      saveData();
      renderInventoryGrid(activeTab.items);
      return true;
    } else if (slot.items[0].name === libraryItem.name) {
      slot.items[0].quantity += quantity;
      saveData();
      renderInventoryGrid(activeTab.items);
      return true;
    }
  }

  return false; // Inventory full
}

function useItem(itemName) {
  const activeTab = tabs.find((t) => t.id === activeTabId);
  if (!activeTab) return;

  for (let slot of activeTab.items) {
    if (slot.items.length > 0 && slot.items[0].name.toLowerCase() === itemName.toLowerCase()) {
      if (slot.items[0].quantity > 1) {
        slot.items[0].quantity -= 1;
      } else {
        slot.items = [];
      }
      saveData();
      renderInventoryGrid(activeTab.items);
      commandOutput.textContent = `Used 1 ${itemName}.`;
      return;
    }
  }
  commandOutput.textContent = `Item "${itemName}" not found in inventory.`;
}

function runCommand() {
  const command = commandInput.value.trim();
  if (!command) return;

  let output = `Command: ${command}`;
  
  const addMatch = command.match(/^add\s+(.+?)(?:\s+(\d+))?$/i);
  const damageMatch = command.match(/^damage\s+(\d+)$/i);
  const moneyMatch = command.match(/^money\s+([+-]?\d+)$/i);
  const healthMaxMatch = command.match(/^health\s+max\s+(\d+)$/i);
  const healthSetMatch = command.match(/^health\s+(\d+)$/i);
  const useMatch = command.match(/^use\s+(.+)$/i);
  const healMatch = command.match(/^heal\s+(\d+)$/i);
  const statusMatch = command.match(/^status\s+(.+)$/i);

  if (addMatch) {
    const itemName = addMatch[1];
    const quantity = addMatch[2] ? parseInt(addMatch[2]) : 1;
    
    if (activeTabId === 'item-library') {
      output = 'Cannot add items from Item Library tab. Switch to an inventory tab first.';
    } else if (addItemToInventory(itemName, quantity)) {
      output = `Added ${quantity} ${itemName}(s) to inventory.`;
    } else {
      output = `Item "${itemName}" not found in library or inventory is full. Available items: ${itemLibraryEntries.map((i) => i.name).join(', ')}`;
    }
  } else if (damageMatch) {
    const damage = parseInt(damageMatch[1]);
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab) {
      activeTab.health -= damage;
      if (activeTab.health < 0) activeTab.health = 0;
      saveData();
      updateHealthDisplay(activeTab.health, activeTab.maxHealth);
      output = `Health: ${activeTab.health}`;
    } else {
      output = 'No active tab.';
    }
  } else if (moneyMatch) {
    const amount = parseInt(moneyMatch[1]);
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab) {
      activeTab.money += amount;
      saveData();
      portraitMoneyBadge.querySelector('strong').textContent = activeTab.money;
      output = `Money: ${activeTab.money} coins.`;
    } else {
      output = 'No active tab.';
    }
  } else if (healthMaxMatch) {
    const maxHealth = parseInt(healthMaxMatch[1], 10);
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab) {
      activeTab.maxHealth = maxHealth;
      if (activeTab.health > activeTab.maxHealth) {
        activeTab.health = activeTab.maxHealth;
      }
      saveData();
      updateHealthDisplay(activeTab.health, activeTab.maxHealth);
      output = `Max health set to ${activeTab.maxHealth}.`;
    } else {
      output = 'No active tab.';
    }
  } else if (healthSetMatch) {
    const newHealth = parseInt(healthSetMatch[1], 10);
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab) {
      activeTab.health = Math.min(Math.max(newHealth, 0), activeTab.maxHealth);
      saveData();
      updateHealthDisplay(activeTab.health, activeTab.maxHealth);
      output = `Health set to ${activeTab.health}.`;
    } else {
      output = 'No active tab.';
    }
  } else if (useMatch) {
    const itemName = useMatch[1];
    useItem(itemName);
    return; // useItem sets output
  } else if (healMatch) {
    const heal = parseInt(healMatch[1]);
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab) {
      activeTab.health += heal;
      if (activeTab.health > activeTab.maxHealth) activeTab.health = activeTab.maxHealth;
      saveData();
      updateHealthDisplay(activeTab.health, activeTab.maxHealth);
      output = `Health: ${activeTab.health}`;
    } else {
      output = 'No active tab.';
    }
  } else if (statusMatch) {
    const statusArgs = statusMatch[1].trim();
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab) {
      if (statusArgs.toLowerCase().startsWith('remove ')) {
        const name = statusArgs.slice(7).trim();
        activeTab.statusEffects = activeTab.statusEffects.filter(e => e.name.toLowerCase() !== name.toLowerCase());
        saveData();
        renderStatusEffects(activeTab.statusEffects);
        output = `Removed status effect "${name}".`;
      } else {
        const parts = statusArgs.split(/\s+image\s+/i);
        if (parts.length === 2) {
          const name = parts[0].trim();
          const imageName = parts[1].trim();
          const libraryItem = itemLibraryEntries.find(i => i.name.toLowerCase() === imageName.toLowerCase());
          if (libraryItem) {
            activeTab.statusEffects.push({ name, image: libraryItem.image });
            saveData();
            renderStatusEffects(activeTab.statusEffects);
            output = `Added status effect "${name}" with image.`;
          } else {
            output = `Item "${imageName}" not found in library.`;
          }
        } else {
          const name = statusArgs.trim();
          activeTab.statusEffects.push({ name });
          saveData();
          renderStatusEffects(activeTab.statusEffects);
          output = `Added status effect "${name}".`;
        }
      }
    } else {
      output = 'No active tab.';
    }
  } else {
    output = 'Unrecognized command. Try:\n- `add item name` or `add item name 5`\n- `use item name`\n- `damage number`\n- `heal number`\n- `money +10` or `money -5`\n- `status name` or `status name image item name`\n- `status remove name`';
  }

  commandOutput.textContent = output;
  commandInput.value = '';
}

function toggleTabsMenu() {
  tabMenuOpen = !tabMenuOpen;
  tabMenu.classList.toggle('hidden', !tabMenuOpen);
}

// Initialize UI
loadData();
renderTabButtons();
selectTab(activeTabId);
renderItemLibrary();

toggleTabMenu.addEventListener('click', toggleTabsMenu);
addTabButton.addEventListener('click', addTab);
tabNameInput.addEventListener('input', () => {
  updateActiveTabMeta();
  renderTabButtons();
});
tabDescriptionInput.addEventListener('input', updateActiveTabMeta);
portraitPlaceholder.addEventListener('click', handlePortraitPlaceholderClick);
portraitFileInput.addEventListener('change', handlePortraitFileUpdate);
itemImageFileInput.addEventListener('change', () => {
  const file = itemImageFileInput.files[0];
  if (autoAddImageCheckbox.checked && file) {
    addLibraryItemFromFile(file);
  }
});
itemForm.addEventListener('dragover', (e) => {
  e.preventDefault();
  itemForm.classList.add('drag-over');
});
itemForm.addEventListener('dragleave', () => {
  itemForm.classList.remove('drag-over');
});
itemForm.addEventListener('drop', (e) => {
  e.preventDefault();
  itemForm.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  if (autoAddImageCheckbox.checked) {
    addLibraryItemFromFile(file);
  }
});
addItemButton.addEventListener('click', () => {
  let name = itemNameInput.value.trim();
  const imageFile = itemImageFileInput.files[0];

  if (!name && imageFile) {
    name = imageFile.name.replace(/\.[^/.]+$/, '');
  }

  if (!name) return;

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = e.target.result;
      itemLibraryEntries.push({ name, image });
      saveData();
      renderItemLibrary();
      itemNameInput.value = '';
      itemImageFileInput.value = '';
    };
    reader.readAsDataURL(imageFile);
  } else {
    const image = 'https://images.unsplash.com/photo-1505593395545-4a6d1fb01b02?auto=format&fit=crop&w=400&q=60';
    itemLibraryEntries.push({ name, image });
    saveData();
    renderItemLibrary();
    itemNameInput.value = '';
  }
});
runCommandButton.addEventListener('click', runCommand);
commandInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    runCommand();
  }
});
itemAddBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  adjustInventorySlotQuantity(1);
});
itemRemoveBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  adjustInventorySlotQuantity(-1);
});
itemDeleteBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  removeInventorySlotItem();
});
showCommandsBtn.addEventListener('click', () => {
  commandHelp.classList.toggle('hidden');
});
libraryButtonHeader.addEventListener('click', () => {
  selectTab('item-library');
});

// Hide menu when clicking outside
document.addEventListener('click', (e) => {
  if (!itemMenu.contains(e.target) && !e.target.closest('.grid-cell')) {
    hideItemMenu();
  }
});

const defaultAssets = [
  {
    assetId: "LAP-001",
    deviceName: "Dell Latitude 5450",
    deviceType: "Laptop",
    assignedTo: "S. Janssen",
    department: "Finance",
    status: "Issued",
    condition: "Good",
    returnDate: "2026-08-31",
    notes: "Includes charger and laptop bag."
  },
  {
    assetId: "MON-014",
    deviceName: "Samsung 27 inch Monitor",
    deviceType: "Monitor",
    assignedTo: "",
    department: "IT Storage",
    status: "Available",
    condition: "Minor Scratches",
    returnDate: "",
    notes: "Stored in cabinet B."
  },
  {
    assetId: "PHN-022",
    deviceName: "iPhone 15",
    deviceType: "Phone",
    assignedTo: "M. de Vries",
    department: "Sales",
    status: "Repair",
    condition: "Needs Repair",
    returnDate: "",
    notes: "Screen replacement required."
  }
];

let assets = JSON.parse(localStorage.getItem("assets")) || defaultAssets;

const tableBody = document.getElementById("assetTableBody");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("assetModal");
const form = document.getElementById("assetForm");

const fields = {
  editIndex: document.getElementById("editIndex"),
  assetId: document.getElementById("assetId"),
  deviceName: document.getElementById("deviceName"),
  deviceType: document.getElementById("deviceType"),
  assignedTo: document.getElementById("assignedTo"),
  department: document.getElementById("department"),
  status: document.getElementById("status"),
  condition: document.getElementById("condition"),
  returnDate: document.getElementById("returnDate"),
  notes: document.getElementById("notes")
};

function saveAssets() {
  localStorage.setItem("assets", JSON.stringify(assets));
}

function statusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

function needsAttention(asset) {
  return asset.status === "Repair" || asset.condition === "Needs Repair" || asset.condition === "Broken";
}

function renderStats() {
  document.getElementById("totalAssets").textContent = assets.length;
  document.getElementById("issuedAssets").textContent = assets.filter(a => a.status === "Issued").length;
  document.getElementById("availableAssets").textContent = assets.filter(a => a.status === "Available").length;
  document.getElementById("attentionAssets").textContent = assets.filter(needsAttention).length;
}

function renderTable() {
  const query = searchInput.value.toLowerCase();

  const filteredAssets = assets.filter(asset => {
    return Object.values(asset).join(" ").toLowerCase().includes(query);
  });

  tableBody.innerHTML = filteredAssets.map((asset, index) => {
    const realIndex = assets.indexOf(asset);

    return `
      <tr>
        <td>${asset.assetId}</td>
        <td>${asset.deviceName}</td>
        <td>${asset.deviceType}</td>
        <td>${asset.assignedTo || "—"}</td>
        <td>${asset.department || "—"}</td>
        <td><span class="status ${statusClass(asset.status)}">${asset.status}</span></td>
        <td>${asset.condition}</td>
        <td>${asset.returnDate || "—"}</td>
        <td><button class="row-btn" onclick="editAsset(${realIndex})">Edit</button></td>
      </tr>
    `;
  }).join("");

  renderStats();
}

function openModal() {
  document.getElementById("modalTitle").textContent = "Add Asset";
  document.getElementById("deleteAssetBtn").classList.add("hidden");
  form.reset();
  fields.editIndex.value = "";
  modal.showModal();
}

function closeModal() {
  modal.close();
}

function editAsset(index) {
  const asset = assets[index];

  document.getElementById("modalTitle").textContent = "Edit Asset";
  document.getElementById("deleteAssetBtn").classList.remove("hidden");

  fields.editIndex.value = index;
  fields.assetId.value = asset.assetId;
  fields.deviceName.value = asset.deviceName;
  fields.deviceType.value = asset.deviceType;
  fields.assignedTo.value = asset.assignedTo;
  fields.department.value = asset.department;
  fields.status.value = asset.status;
  fields.condition.value = asset.condition;
  fields.returnDate.value = asset.returnDate;
  fields.notes.value = asset.notes;

  modal.showModal();
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const asset = {
    assetId: fields.assetId.value.trim(),
    deviceName: fields.deviceName.value.trim(),
    deviceType: fields.deviceType.value,
    assignedTo: fields.assignedTo.value.trim(),
    department: fields.department.value.trim(),
    status: fields.status.value,
    condition: fields.condition.value,
    returnDate: fields.returnDate.value,
    notes: fields.notes.value.trim()
  };

  const editIndex = fields.editIndex.value;

  if (editIndex === "") {
    assets.push(asset);
  } else {
    assets[Number(editIndex)] = asset;
  }

  saveAssets();
  renderTable();
  closeModal();
});

document.getElementById("deleteAssetBtn").addEventListener("click", () => {
  const index = Number(fields.editIndex.value);
  assets.splice(index, 1);
  saveAssets();
  renderTable();
  closeModal();
});

document.getElementById("addAssetBtn").addEventListener("click", openModal);
document.getElementById("closeModalBtn").addEventListener("click", closeModal);
searchInput.addEventListener("input", renderTable);

renderTable();

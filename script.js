const isConfigured =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("PASTE_YOUR") &&
  !SUPABASE_ANON_KEY.includes("PASTE_YOUR");

const setupNotice = document.getElementById("setupNotice");
const authPanel = document.getElementById("authPanel");
const appPanel = document.getElementById("appPanel");
const userArea = document.getElementById("userArea");
const userEmail = document.getElementById("userEmail");
const syncStatus = document.getElementById("syncStatus");

const tableBody = document.getElementById("assetTableBody");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("assetModal");
const form = document.getElementById("assetForm");

const fields = {
  assetDbId: document.getElementById("assetDbId"),
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

let supabaseClient = null;
let currentUser = null;
let assets = [];
let realtimeChannel = null;

if (isConfigured) {
  setupNotice.classList.add("hidden");
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  init();
} else {
  authPanel.classList.add("hidden");
}

async function init() {
  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    currentUser = data.session.user;
    showApp();
  } else {
    showAuth();
  }

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;

    if (currentUser) {
      showApp();
    } else {
      showAuth();
    }
  });
}

function showAuth() {
  authPanel.classList.remove("hidden");
  appPanel.classList.add("hidden");
  userArea.classList.add("hidden");

  if (realtimeChannel) {
    supabaseClient.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}

async function showApp() {
  userEmail.textContent = currentUser.email;
  userArea.classList.remove("hidden");
  authPanel.classList.add("hidden");
  appPanel.classList.remove("hidden");

  await loadAssets();
  subscribeToLiveChanges();
}

async function loadAssets() {
  syncStatus.textContent = "Loading assets...";

  const { data, error } = await supabaseClient
    .from("assets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    syncStatus.textContent = "Error loading assets. Check your Supabase table and policies.";
    console.error(error);
    return;
  }

  assets = data || [];
  renderTable();
  syncStatus.textContent = "Live sync active";
}

function subscribeToLiveChanges() {
  if (realtimeChannel) return;

  realtimeChannel = supabaseClient
    .channel("assets-live-updates")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "assets"
      },
      async () => {
        syncStatus.textContent = "Updating live...";
        await loadAssets();
      }
    )
    .subscribe(status => {
      if (status === "SUBSCRIBED") {
        syncStatus.textContent = "Live sync active";
      }
    });
}

function statusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

function needsAttention(asset) {
  return asset.status === "Repair" || asset.condition === "Needs Repair" || asset.condition === "Broken";
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
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

  tableBody.innerHTML = filteredAssets.map(asset => `
    <tr>
      <td>${asset.asset_id}</td>
      <td>${asset.device_name}</td>
      <td>${asset.device_type}</td>
      <td>${asset.assigned_to || "—"}</td>
      <td>${asset.department || "—"}</td>
      <td><span class="status ${statusClass(asset.status)}">${asset.status}</span></td>
      <td>${asset.condition}</td>
      <td>${asset.return_date || "—"}</td>
      <td>${asset.updated_by_email || "—"}</td>
      <td>${formatDateTime(asset.updated_at)}</td>
      <td><button class="row-btn" onclick="editAsset('${asset.id}')">Edit</button></td>
    </tr>
  `).join("");

  renderStats();
}

function openModal() {
  document.getElementById("modalTitle").textContent = "Add Asset";
  document.getElementById("deleteAssetBtn").classList.add("hidden");
  form.reset();
  fields.assetDbId.value = "";
  modal.showModal();
}

function closeModal() {
  modal.close();
}

function editAsset(id) {
  const asset = assets.find(item => item.id === id);
  if (!asset) return;

  document.getElementById("modalTitle").textContent = "Edit Asset";
  document.getElementById("deleteAssetBtn").classList.remove("hidden");

  fields.assetDbId.value = asset.id;
  fields.assetId.value = asset.asset_id;
  fields.deviceName.value = asset.device_name;
  fields.deviceType.value = asset.device_type;
  fields.assignedTo.value = asset.assigned_to || "";
  fields.department.value = asset.department || "";
  fields.status.value = asset.status;
  fields.condition.value = asset.condition;
  fields.returnDate.value = asset.return_date || "";
  fields.notes.value = asset.notes || "";

  modal.showModal();
}

async function saveAsset(event) {
  event.preventDefault();

  const asset = {
    asset_id: fields.assetId.value.trim(),
    device_name: fields.deviceName.value.trim(),
    device_type: fields.deviceType.value,
    assigned_to: fields.assignedTo.value.trim(),
    department: fields.department.value.trim(),
    status: fields.status.value,
    condition: fields.condition.value,
    return_date: fields.returnDate.value || null,
    notes: fields.notes.value.trim(),
    updated_by: currentUser.id,
    updated_by_email: currentUser.email
  };

  const id = fields.assetDbId.value;
  let result;

  if (id) {
    result = await supabaseClient
      .from("assets")
      .update(asset)
      .eq("id", id);
  } else {
    result = await supabaseClient
      .from("assets")
      .insert({
        ...asset,
        created_by: currentUser.id,
        created_by_email: currentUser.email
      });
  }

  if (result.error) {
    alert("Could not save asset. Check the browser console and Supabase policies.");
    console.error(result.error);
    return;
  }

  closeModal();
  await loadAssets();
}

async function deleteAsset() {
  const id = fields.assetDbId.value;
  if (!id) return;

  const confirmed = confirm("Delete this asset?");
  if (!confirmed) return;

  const { error } = await supabaseClient
    .from("assets")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Could not delete asset.");
    console.error(error);
    return;
  }

  closeModal();
  await loadAssets();
}

document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    alert(error.message);
  }
});

document.getElementById("signupForm").addEventListener("submit", async event => {
  event.preventDefault();

  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  const { error } = await supabaseClient.auth.signUp({ email, password });

  if (error) {
    alert(error.message);
  } else {
    alert("Account created. Check your email if confirmation is enabled in Supabase.");
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
});

document.getElementById("addAssetBtn").addEventListener("click", openModal);
document.getElementById("closeModalBtn").addEventListener("click", closeModal);
document.getElementById("deleteAssetBtn").addEventListener("click", deleteAsset);
searchInput.addEventListener("input", renderTable);
form.addEventListener("submit", saveAsset);

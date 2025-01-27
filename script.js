/****************************************************
  GLOBAL DATA
*****************************************************/
let guestsList = []; 
let currentGuest = null; // the main guest currently loaded in the invitation

// Some constants for the language <select> options
const LANG_OPTIONS = ["en","fr","ar"];

/****************************************************
  TRANSLATIONS
*****************************************************/
const translations = {
  en: {
    weddingTitle: "Christina’s and Gerges’s Wedding",
    welcomeMsg: "Hello {allNames}!",
    helloPlaceholder: "Hello dear guest!",
    weddingDetailsTitle: "Wedding Details",
    dateLabel: "Date: August 23, 2025",
    churchLabel: "Church: Saint Elie Church, 5:00 PM (<a href='https://maps.app.goo.gl/ATj56wNMUn2gixk5A' target='_blank'>Map</a>)",
    receptionLabel: "Party: Château Cana, 8:00 PM (<a href='https://maps.app.goo.gl/jRooZVWtH3HxwTHN6' target='_blank'>Map</a>)",
    dressCodeLabel: "Dress Code: Formal attire",
    rsvpHeading: "RSVP",
    yesLabel: "Yes",
    noLabel: "No",
    maybeLabel: "Maybe",
    saveBtn: "Save",
    modifyBtn: "Modify",
    changeLangLabel: "Change Language:",
    contactInfoTitle: "Need info about traveling or accommodations?",
    contactInfoSub: "Contact us on WhatsApp:",
    chatWithGerges: "Chat with Gerges",
    chatWithChristina: "Chat with Christina"
  },
  fr: {
    weddingTitle: "Mariage de Christina et Gerges",
    welcomeMsg: "Bonjour {allNames}!",
    helloPlaceholder: "Bonjour cher invité!",
    weddingDetailsTitle: "Détails du Mariage",
    dateLabel: "Date : 23 août 2025",
    churchLabel: "Église : Église Saint Elie, 17h00 (<a href='https://maps.app.goo.gl/ATj56wNMUn2gixk5A' target='_blank'>Carte</a>)",
    receptionLabel: "Fête : Château Cana, 20h00 (<a href='https://maps.app.goo.gl/jRooZVWtH3HxwTHN6' target='_blank'>Carte</a>)",
    dressCodeLabel: "Tenue : Tenue formelle",
    rsvpHeading: "RSVP (Fr)",
    yesLabel: "Oui",
    noLabel: "Non",
    maybeLabel: "Peut-être",
    saveBtn: "Enregistrer",
    modifyBtn: "Modifier",
    changeLangLabel: "Changer de langue :",
    contactInfoTitle: "Besoin d'informations sur le voyage ou le logement ?",
    contactInfoSub: "Contactez-nous sur WhatsApp :",
    chatWithGerges: "Discuter avec Gerges",
    chatWithChristina: "Discuter avec Christina"
  },
  ar: {
    weddingTitle: "عرس كريستينا وجرجس",
    welcomeMsg: "مرحبًا {allNames}!",
    helloPlaceholder: "مرحباً أيها الضيف العزيز!",
    weddingDetailsTitle: "تفاصيل الزفاف",
    dateLabel: "التاريخ: 23 آب 2025",
    churchLabel: "الكنيسة: كنيسة مار الياس، الساعة 5:00 مساءً (<a href='https://maps.app.goo.gl/ATj56wNMUn2gixk5A' target='_blank'>الخريطة</a>)",
    receptionLabel: "الحفلة: شاتو كانا، الساعة 8:00 مساءً (<a href='https://maps.app.goo.gl/jRooZVWtH3HxwTHN6' target='_blank'>الخريطة</a>)",
    dressCodeLabel: "اللباس: ملابس رسمية",
    rsvpHeading: "تأكيد الحضور",
    yesLabel: "نعم",
    noLabel: "لا",
    maybeLabel: "ربما",
    saveBtn: "حفظ",
    modifyBtn: "تعديل",
    changeLangLabel: "تغيير اللغة:",
    contactInfoTitle: "هل تحتاج إلى معلومات حول السفر أو الإقامة؟",
    contactInfoSub: "تواصل معنا عبر الواتساب:",
    chatWithGerges: "الدردشة مع جرجس",
    chatWithChristina: "الدردشة مع كريستينا"
  }
};

/****************************************************
  ON PAGE LOAD
*****************************************************/
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  initAdminPanel();
  initInvitationSection();
});

/****************************************************
  NAVIGATION
*****************************************************/
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      showSection(targetId);
    });
  });
}

function showSection(sectionId) {
  document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
  document.getElementById(sectionId).classList.remove('hidden');
}

/****************************************************
  ADMIN PANEL
*****************************************************/
function initAdminPanel() {
  const adminAuthBtn = document.getElementById('admin-auth-btn');
  const adminContent = document.getElementById('admin-content');

  const addMainGuestBtn = document.getElementById('addMainGuestBtn');
  const guestTableBody = document.querySelector('#guest-table tbody');

  // Dev Access
  adminAuthBtn.addEventListener('click', () => {
    const pw = prompt('Enter developer password:');
    if (pw === 'Cidreknefe9$') {
      adminContent.classList.remove('hidden');
    } else {
      alert('Incorrect password!');
    }
  });

  // "Add Main Guest" button => push a new main row
  addMainGuestBtn.addEventListener('click', () => {
    const newMain = {
      id: generateId(),
      mainFirstName: "",
      mainLastName: "",
      arabicMainFirstName: "",
      arabicMainLastName: "",
      defaultLang: "en",
      familySize: 1,
      subGuests: [],
      rsvpMain: null,
      isRsvpFrozen: false
    };
    guestsList.push(newMain);
    updateGuestTable(guestTableBody);
  });

  initExcelImportExport();
}

/****************************************************
  EXCEL IMPORT / EXPORT
*****************************************************/
function initExcelImportExport() {
  const excelFileInput = document.getElementById('excelFileInput');
  const importBtn = document.getElementById('importExcelBtn');
  const exportBtn = document.getElementById('exportExcelBtn');

  importBtn.addEventListener('click', () => {
    const file = excelFileInput.files && excelFileInput.files[0];
    if (!file) {
      alert('Please select an Excel file first.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const ws = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

      let lastMain = null;
      rows.forEach((row, idx) => {
        // skip header row if "Type"
        if (idx === 0 && String(row[0]).toLowerCase().includes("type")) return;
        if (row.length < 2) return;

        const rowType = (row[0] || "").trim();
        const firstName = (row[1] || "").trim();
        const lastName = (row[2] || "").trim();
        const arabicFirst = (row[3] || "").trim();
        const arabicLast = (row[4] || "").trim();

        function parseRsvp(yes, no, maybe) {
          if (String(yes).trim() === "1") return "yes";
          if (String(no).trim() === "1") return "no";
          if (String(maybe).trim() === "1") return "maybe";
          return null;
        }
        let rowRsvp = parseRsvp(row[7] || "", row[8] || "", row[9] || "");

        if (rowType.toLowerCase() === "main") {
          let fs = parseInt(row[5] || "1", 10);
          if (isNaN(fs) || fs<1) fs=1;
          let lang = (row[6] || "en").trim();

          const mainObj = {
            id: generateId(),
            mainFirstName: firstName,
            mainLastName: lastName,
            arabicMainFirstName: arabicFirst,
            arabicMainLastName: arabicLast,
            defaultLang: lang,
            familySize: fs,
            subGuests: [],
            rsvpMain: rowRsvp,
            isRsvpFrozen: rowRsvp ? true : false
          };
          guestsList.push(mainObj);
          lastMain = mainObj;
        } else {
          // sub
          if (!lastMain) return;
          const subObj = {
            firstName,
            lastName,
            arabicFirstName: arabicFirst,
            arabicLastName: arabicLast,
            language: lastMain.defaultLang,
            rsvp: rowRsvp
          };
          lastMain.subGuests.push(subObj);
          lastMain.familySize = 1 + lastMain.subGuests.length;
        }
      });

      updateGuestTable(document.querySelector('#guest-table tbody'));
      alert('Excel file imported successfully!');
    };
    reader.readAsArrayBuffer(file);
  });

  exportBtn.addEventListener('click', () => {
    const data = [];
    data.push(["Type","Normal First Name","Normal Last Name","Arabic First Name","Arabic Last Name","# Family","Language","Yes","No","Maybe"]);

    guestsList.forEach(m => {
      function rsvpToTriple(rsvp) {
        if (rsvp === "yes") return ["1","0","0"];
        if (rsvp === "no") return ["0","1","0"];
        if (rsvp === "maybe") return ["0","0","1"];
        return ["NaN","NaN","NaN"];
      }
      const [myes,mno,mmaybe] = rsvpToTriple(m.rsvpMain);

      data.push([
        "Main",
        m.mainFirstName,
        m.mainLastName,
        m.arabicMainFirstName,
        m.arabicMainLastName,
        m.familySize,
        m.defaultLang,
        myes,
        mno,
        mmaybe
      ]);

      m.subGuests.forEach(sg => {
        const [syes,sno,smaybe] = rsvpToTriple(sg.rsvp);
        data.push([
          "",
          sg.firstName,
          sg.lastName,
          sg.arabicFirstName,
          sg.arabicLastName,
          "",
          sg.language || m.defaultLang,
          syes,
          sno,
          smaybe
        ]);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GuestListUpdated");
    XLSX.writeFile(wb, "UpdatedGuestList.xlsx");
  });
}

/****************************************************
  TABLE
*****************************************************/
function updateGuestTable(tbody) {
  tbody.innerHTML = '';

  guestsList.forEach(mainG => {
    // MAIN
    const trMain = document.createElement('tr');

    const tdType = document.createElement('td');
    tdType.textContent = 'Main';

    const tdF = document.createElement('td');
    tdF.innerHTML = `<input type="text" value="${mainG.mainFirstName}"
       onchange="onUpdateMainGuestField('${mainG.id}','mainFirstName',this.value)" />`;
    const tdL = document.createElement('td');
    tdL.innerHTML = `<input type="text" value="${mainG.mainLastName}"
       onchange="onUpdateMainGuestField('${mainG.id}','mainLastName',this.value)" />`;
    const tdAF = document.createElement('td');
    tdAF.innerHTML = `<input type="text" value="${mainG.arabicMainFirstName}"
       onchange="onUpdateMainGuestField('${mainG.id}','arabicMainFirstName',this.value)" />`;
    const tdAL = document.createElement('td');
    tdAL.innerHTML = `<input type="text" value="${mainG.arabicMainLastName}"
       onchange="onUpdateMainGuestField('${mainG.id}','arabicMainLastName',this.value)" />`;

    const tdFam = document.createElement('td');
    tdFam.innerHTML = `<input type="number" min="1" style="width:60px" value="${mainG.familySize}"
       onchange="onUpdateMainGuestField('${mainG.id}','familySize',this.value)" />`;

    const tdLang = document.createElement('td');
    tdLang.appendChild(createLangSelect(mainG.defaultLang, newVal => {
      onUpdateMainGuestField(mainG.id, 'defaultLang', newVal);
      updateGuestTable(tbody);
    }));

    const tdYes = document.createElement('td');
    tdYes.textContent = (!mainG.rsvpMain) ? 'NaN' : (mainG.rsvpMain === 'yes' ? '1' : '0');
    const tdNo = document.createElement('td');
    tdNo.textContent = (!mainG.rsvpMain) ? 'NaN' : (mainG.rsvpMain === 'no' ? '1' : '0');
    const tdMaybe = document.createElement('td');
    tdMaybe.textContent = (!mainG.rsvpMain) ? 'NaN' : (mainG.rsvpMain === 'maybe' ? '1' : '0');

    // "Open Invitation"
    const tdOpen = document.createElement('td');
    const btnOpen = document.createElement('button');
    btnOpen.textContent = 'Open Invitation';
    btnOpen.classList.add('btn-green');
    btnOpen.addEventListener('click', () => {
      showSection('invitation-section');
      loadGuestData(mainG.id);
    });
    tdOpen.appendChild(btnOpen);

    // Actions => "Add Sub Guest" & "Delete"
    const tdActions = document.createElement('td');

    // Add Sub Guest
    const addSubBtn = document.createElement('button');
    addSubBtn.textContent = '+Sub';
    addSubBtn.classList.add('btn-orange');
    addSubBtn.style.marginRight = '5px';
    addSubBtn.addEventListener('click', () => {
      mainG.subGuests.push({
        firstName: "",
        lastName: "",
        arabicFirstName: "",
        arabicLastName: "",
        language: mainG.defaultLang,
        rsvp: null
      });
      mainG.familySize = 1 + mainG.subGuests.length;
      updateGuestTable(tbody);
    });
    tdActions.appendChild(addSubBtn);

    // Delete main
    const btnDel = document.createElement('button');
    btnDel.textContent = 'Delete';
    btnDel.classList.add('btn-red');
    btnDel.addEventListener('click', () => {
      deleteMainGuest(mainG.id);
    });
    tdActions.appendChild(btnDel);

    trMain.appendChild(tdType);
    trMain.appendChild(tdF);
    trMain.appendChild(tdL);
    trMain.appendChild(tdAF);
    trMain.appendChild(tdAL);
    trMain.appendChild(tdFam);
    trMain.appendChild(tdLang);
    trMain.appendChild(tdYes);
    trMain.appendChild(tdNo);
    trMain.appendChild(tdMaybe);
    trMain.appendChild(tdOpen);
    trMain.appendChild(tdActions);

    tbody.appendChild(trMain);

    // SUB
    mainG.subGuests.forEach((subG, idx) => {
      const trSub = document.createElement('tr');

      const tdSType = document.createElement('td');
      tdSType.textContent = '';

      const tdSF = document.createElement('td');
      tdSF.innerHTML = `<input type="text" value="${subG.firstName}"
         onchange="onUpdateSubGuestField('${mainG.id}',${idx},'firstName',this.value)" />`;
      const tdSL = document.createElement('td');
      tdSL.innerHTML = `<input type="text" value="${subG.lastName}"
         onchange="onUpdateSubGuestField('${mainG.id}',${idx},'lastName',this.value)" />`;
      const tdSAF = document.createElement('td');
      tdSAF.innerHTML = `<input type="text" value="${subG.arabicFirstName}"
         onchange="onUpdateSubGuestField('${mainG.id}',${idx},'arabicFirstName',this.value)" />`;
      const tdSAL = document.createElement('td');
      tdSAL.innerHTML = `<input type="text" value="${subG.arabicLastName}"
         onchange="onUpdateSubGuestField('${mainG.id}',${idx},'arabicLastName',this.value)" />`;

      const tdSFam = document.createElement('td');
      tdSFam.textContent = '—';

      // sub's language => in own <select>
      const tdSLang = document.createElement('td');
      tdSLang.appendChild(createLangSelect(subG.language || mainG.defaultLang, newVal => {
        subG.language = newVal;
        updateGuestTable(tbody);
      }));

      const tdSYes = document.createElement('td');
      tdSYes.textContent = (!subG.rsvp) ? 'NaN' : (subG.rsvp === 'yes' ? '1' : '0');

      const tdSNo = document.createElement('td');
      tdSNo.textContent = (!subG.rsvp) ? 'NaN' : (subG.rsvp === 'no' ? '1' : '0');

      const tdSMaybe = document.createElement('td');
      tdSMaybe.textContent = (!subG.rsvp) ? 'NaN' : (subG.rsvp === 'maybe' ? '1' : '0');

      const tdSOpen = document.createElement('td');
      tdSOpen.textContent = '';

      const tdSActions = document.createElement('td');
      const subDelBtn = document.createElement('button');
      subDelBtn.textContent = 'Delete';
      subDelBtn.classList.add('btn-red');
      subDelBtn.addEventListener('click', () => {
        deleteSubGuest(mainG.id, idx);
      });
      tdSActions.appendChild(subDelBtn);

      trSub.appendChild(tdSType);
      trSub.appendChild(tdSF);
      trSub.appendChild(tdSL);
      trSub.appendChild(tdSAF);
      trSub.appendChild(tdSAL);
      trSub.appendChild(tdSFam);
      trSub.appendChild(tdSLang);
      trSub.appendChild(tdSYes);
      trSub.appendChild(tdSNo);
      trSub.appendChild(tdSMaybe);
      trSub.appendChild(tdSOpen);
      trSub.appendChild(tdSActions);

      tbody.appendChild(trSub);
    });
  });
}

/** Utility: builds a <select> for the 3 languages */
function createLangSelect(currentVal, onChangeCallback){
  const sel = document.createElement('select');
  LANG_OPTIONS.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    if (opt === currentVal) option.selected = true;
    sel.appendChild(option);
  });
  sel.addEventListener('change', () => {
    onChangeCallback(sel.value);
  });
  return sel;
}

/****************************************************
  UPDATE FIELDS
*****************************************************/
function onUpdateMainGuestField(gid, field, val) {
  const m = guestsList.find(x => x.id === gid);
  if (!m) return;
  if (field === 'familySize') {
    const newSz = parseInt(val,10);
    if (!isNaN(newSz) && newSz>0) {
      m.familySize = newSz;
    } else {
      alert('Invalid family size. Must be >=1');
    }
    // Not auto-adding or removing sub rows
  } else {
    m[field] = val.trim();
  }
}

function onUpdateSubGuestField(mainId, idx, field, val) {
  const m = guestsList.find(x => x.id === mainId);
  if (!m || !m.subGuests[idx]) return;
  m.subGuests[idx][field] = val.trim();
}

/****************************************************
  DELETION
*****************************************************/
function deleteMainGuest(gid) {
  guestsList = guestsList.filter(x => x.id !== gid);
  updateGuestTable(document.querySelector('#guest-table tbody'));
}

function deleteSubGuest(mainId, subIndex) {
  const m = guestsList.find(x => x.id === mainId);
  if (!m) return;
  m.subGuests.splice(subIndex, 1);
  m.familySize = 1 + m.subGuests.length; // sync familySize
  updateGuestTable(document.querySelector('#guest-table tbody'));
}

function generateId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

/****************************************************
  INVITATION SECTION
*****************************************************/
function initInvitationSection() {
  const rsvpForm = document.getElementById('rsvp-form');
  const saveBtn = document.getElementById('save-btn');
  const modifyBtn = document.getElementById('modify-btn');

  rsvpForm.addEventListener('change', () => {
    if (!currentGuest) return;
    const totalNeeded = currentGuest.familySize;
    const checkedCount = getNumberOfSelectedRSVPs();
    if (checkedCount === totalNeeded && !currentGuest.isRsvpFrozen) {
      saveBtn.disabled = false;
    }
  });

  saveBtn.addEventListener('click', () => {
    if (!currentGuest) {
      alert('No guest loaded.');
      return;
    }
    const totalNeeded = currentGuest.familySize;
    const checked = getNumberOfSelectedRSVPs();
    if (checked < totalNeeded) {
      alert('Please select Yes/No/Maybe for each guest.');
      return;
    }

    // store main rsvp
    const mainRadio = document.querySelector('input[name="rsvp-main"]:checked');
    currentGuest.rsvpMain = mainRadio ? mainRadio.value : null;

    // sub
    currentGuest.subGuests.forEach((sg, idx) => {
      const subRadio = document.querySelector(`input[name="rsvp-sub-${idx}"]:checked`);
      sg.rsvp = subRadio ? subRadio.value : null;
    });

    // freeze
    currentGuest.isRsvpFrozen = true;
    freezeOrUnfreezeRSVP(true);
    saveBtn.disabled = true;
    modifyBtn.disabled = false;

    // update table
    updateGuestTable(document.querySelector('#guest-table tbody'));
  });

  modifyBtn.addEventListener('click', () => {
    if (!currentGuest) return;
    currentGuest.isRsvpFrozen = false;
    freezeOrUnfreezeRSVP(false);
    saveBtn.disabled = false;
    modifyBtn.disabled = true;
  });

  // Language switchers
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
      if (currentGuest) buildRSVPForm();
    });
  });
}

/** Build the RSVP form */
function buildRSVPForm() {
  const container = document.getElementById('rsvp-guests-container');
  container.innerHTML = '';

  if (!currentGuest) return;

  // MAIN
  const yesC = (currentGuest.rsvpMain === 'yes') ? 'checked' : '';
  const noC = (currentGuest.rsvpMain === 'no') ? 'checked' : '';
  const maybeC = (currentGuest.rsvpMain === 'maybe') ? 'checked' : '';

  const mainDiv = document.createElement('div');
  mainDiv.innerHTML = `
    <p>${getDisplayName(currentGuest,true)}:</p>
    <label><input type="radio" name="rsvp-main" value="yes" ${yesC}>${translations[document.documentElement.lang].yesLabel}</label>
    <label><input type="radio" name="rsvp-main" value="no" ${noC}>${translations[document.documentElement.lang].noLabel}</label>
    <label><input type="radio" name="rsvp-main" value="maybe" ${maybeC}>${translations[document.documentElement.lang].maybeLabel}</label>
  `;
  container.appendChild(mainDiv);

  // SUB
  currentGuest.subGuests.forEach((sg, idx) => {
    const syes = (sg.rsvp === 'yes') ? 'checked' : '';
    const sno = (sg.rsvp === 'no') ? 'checked' : '';
    const smaybe = (sg.rsvp === 'maybe') ? 'checked' : '';

    const subDiv = document.createElement('div');
    subDiv.innerHTML = `
      <p>${getDisplayName(sg,false)}:</p>
      <label><input type="radio" name="rsvp-sub-${idx}" value="yes" ${syes}>${translations[document.documentElement.lang].yesLabel}</label>
      <label><input type="radio" name="rsvp-sub-${idx}" value="no" ${sno}>${translations[document.documentElement.lang].noLabel}</label>
      <label><input type="radio" name="rsvp-sub-${idx}" value="maybe" ${smaybe}>${translations[document.documentElement.lang].maybeLabel}</label>
    `;
    container.appendChild(subDiv);
  });

  freezeOrUnfreezeRSVP(currentGuest.isRsvpFrozen);
}

function getDisplayName(obj,isMain) {
  const lang = document.documentElement.lang;
  if (lang === 'ar') {
    return isMain ? (obj.arabicMainFirstName || "") : (obj.arabicFirstName || "");
  } else {
    return isMain ? (obj.mainFirstName || "") : (obj.firstName || "");
  }
}

function freezeOrUnfreezeRSVP(freeze) {
  const radios = document.querySelectorAll('#rsvp-guests-container input[type="radio"]');
  radios.forEach(r => r.disabled = freeze);
}

function getNumberOfSelectedRSVPs() {
  return document.querySelectorAll('#rsvp-guests-container input[type="radio"]:checked').length;
}

function loadGuestData(gid) {
  const g = guestsList.find(x => x.id === gid);
  if (!g) return;
  currentGuest = g;

  setLanguage(currentGuest.defaultLang);
  buildRSVPForm();

  if (currentGuest.isRsvpFrozen) {
    document.getElementById('save-btn').disabled = true;
    document.getElementById('modify-btn').disabled = false;
  } else {
    document.getElementById('save-btn').disabled = true;
    document.getElementById('modify-btn').disabled = true;
  }
}

/****************************************************
  setLanguage(...)
*****************************************************/
function setLanguage(langCode) {
  const t = translations[langCode] || translations.en;

  if (langCode === 'ar') {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
  } else {
    document.documentElement.lang = langCode;
    document.documentElement.dir = 'ltr';
  }

  document.getElementById('wedding-title').textContent = t.weddingTitle;

  const welcomeEl = document.getElementById('welcome-text');
  if (currentGuest) {
    const allNames = buildAllFirstNamesString(currentGuest);
    welcomeEl.innerHTML = t.welcomeMsg.replace('{allNames}', allNames);
  } else {
    welcomeEl.textContent = t.helloPlaceholder;
  }

  document.getElementById('wedding-details-title').textContent = t.weddingDetailsTitle;
  document.getElementById('date-label').innerHTML = t.dateLabel;
  document.getElementById('church-label').innerHTML = t.churchLabel;
  document.getElementById('reception-label').innerHTML = t.receptionLabel;
  document.getElementById('dress-code-label').textContent = t.dressCodeLabel;

  document.getElementById('rsvp-heading').textContent = t.rsvpHeading;
  document.getElementById('save-btn').textContent = t.saveBtn;
  document.getElementById('modify-btn').textContent = t.modifyBtn;

  document.getElementById('change-lang-label').textContent = t.changeLangLabel;
  document.getElementById('contact-info-title').textContent = t.contactInfoTitle;
  document.getElementById('contact-info-sub').textContent = t.contactInfoSub;
  document.getElementById('chat-gerges-link').textContent = t.chatWithGerges;
  document.getElementById('chat-christina-link').textContent = t.chatWithChristina;

  updateRSVPLabels(t);
}

function buildAllFirstNamesString(mainGuestObj) {
  const lang = document.documentElement.lang;
  const names = [];

  if (lang === 'ar') {
    names.push(mainGuestObj.arabicMainFirstName || "");
  } else {
    names.push(mainGuestObj.mainFirstName || "");
  }

  mainGuestObj.subGuests.forEach(sub => {
    if (lang === 'ar') {
      names.push(sub.arabicFirstName || "");
    } else {
      names.push(sub.firstName || "");
    }
  });
  return names.filter(x => x.trim()).join(", ");
}

function updateRSVPLabels(t) {
  const radios = document.querySelectorAll('#rsvp-guests-container input[type="radio"]');
  radios.forEach(radio => {
    const labelEl = radio.parentElement;
    if (!labelEl) return;
    switch (radio.value) {
      case 'yes':
        labelEl.lastChild.textContent = t.yesLabel;
        break;
      case 'no':
        labelEl.lastChild.textContent = t.noLabel;
        break;
      case 'maybe':
        labelEl.lastChild.textContent = t.maybeLabel;
        break;
    }
  });
}
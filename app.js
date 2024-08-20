const shoppingList = document.querySelector(".shopping-list");
const shoppingForm = document.querySelector(".shopping-form");
const filterButtons = document.querySelectorAll(".filter-buttons button")
const clearButtons = document.querySelector(".clear");

document.addEventListener("DOMContentLoaded",function(){
    loadItems();
    shoppingForm.addEventListener("submit", handleFormSubmit); 

    for(let button of filterButtons){
        button.addEventListener("click", handleFilterSelection);
    }
    clearButtons.addEventListener("click", clearItems);
} );

//tekrar çalıştığında güncel todoları getirmek için Localstorage kaydetmek
function saveLocalStorage(){
    const listItems = shoppingList.querySelectorAll("li");
    const items = [];

    for(let li of listItems){
        const item = {
            id: li.getAttribute("item-id"),
            name: li.querySelector(".item-name").textContent,
            compeleted: li.hasAttribute("item-completed")
        };
        items.push(item);
    }

    localStorage.setItem("shoppingItems", JSON.stringify(items));
}

function loadItems(){
    const items = JSON.parse(localStorage.getItem("shoppingItems") )|| [];
    shoppingList.innerHTML = "";
    for(let item of items){
       const li = createListItem(item);
       shoppingList.appendChild(li);
    }
     
}
//Tüm todoları silme işlemi 

function clearItems(){
    const shoppingList = document.querySelector(".shopping-list");

    // Eğer liste zaten boşsa, uyarı mesajı göster
    if (shoppingList.children.length === 0) {
        showAlert("danger", "The list is already empty!");
        return; // Fonksiyonu sonlandır
    }
        // Modalı göster
        var confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
        confirmModal.show();
    
        // Modal içerisindeki "Evet" butonuna tıklama işlemi
        document.getElementById("confirmButton").addEventListener("click", function () {
            // Alışveriş listesini temizleme işlemi
            const shoppingList = document.querySelector(".shopping-list");
            shoppingList.innerHTML = ""; // Alışveriş listesini temizler
            showAlert("success", "Successfully Deleted!!");
            saveLocalStorage();  // Yerel depolamayı güncelleme
    
            // Modalı kapat
            confirmModal.hide();
        }, { once: true });

}
//To do ekleme işlemi
function addItem(input){
    const newItem = createListItem({
        id: generateId(),
        name: input,
        compeleted: false
    });
    if(isItemInList(input)){
        showAlert("warning","This iItem Already Exists In The List!")
    }else{
        shoppingList.appendChild(newItem);
        showAlert("success", "Successfully Added!!");
        input.value = "";
    }
    
    
    updateFilterItems();
    saveLocalStorage();
}
//Eklenecek todonun listede varlığı kontrol etme
function isItemInList(itemName, excludeId) {
    const items = shoppingList.querySelectorAll('li');
    for (const item of items) {
        // Öğenin ID'sini kontrol et
        if (item.getAttribute("item-id") !== excludeId) {
            if (item.querySelector(".item-name").textContent.trim().toLowerCase() === itemName.toLowerCase()) {
                return true; // Eleman listede mevcut
            }
        }
    }
    return false; // Eleman listede mevcut değil
}
//to dolara id oluşturma
function generateId(){
    return Math.floor(Math.random() * 100000000);
}
//Uyarılar için alert gösterme işlemi
function showAlert(type,message){
    const alert = document.createElement("div")
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    shoppingList.prepend(alert);

    //setTimeout
    setTimeout(function(){
        alert.remove();
    },2000)
}
//To do girme işlemi(input)
function handleFormSubmit(event) {
    event.preventDefault();
    const input = document.getElementById("item_name");

    // Girilen değeri kontrol et
    const inputValue = input.value.trim();
    if (inputValue.length === 0) {
        showAlert("danger", "Please Enter a Value!");
        return;
    }
    
    // Girilen değeri küçük harfe çevir
    const lowerCaseValue = inputValue.toLowerCase();
    
    // Küçük harfe çevrilmiş değeri kullanarak öğeyi ekle
    addItem(lowerCaseValue);
    
    // Girdiyi temizle
    input.value = "";
}
//To do filtreleme butonları
function handleFilterSelection(event){
    const filterBtn = event.target;
    for(let button of filterButtons){
        button.classList.add("btn-secondary");
        button.classList.remove("btn-primary");
    }
    filterBtn.classList.add("btn-primary");
    filterBtn.classList.remove("btn-secondary");

    filterItems(filterBtn.getAttribute("item-filter"));
}
//To do filtreleme
function filterItems(filterType){

    const li_items = shoppingList.querySelectorAll("li");

    for(let li of li_items){
        li.classList.remove("d-none");
        li.classList.remove("d-block");

        const completed = li.hasAttribute("item-completed");


        if(filterType == "completed"){
            //Tamamlananlar
            li.classList.toggle(completed ? "d-flex" : "d-none");
        }else if(filterType == "incomplete"){
            //Tamamlanmayanlar
            li.classList.toggle(completed ? "d-none" : "d-flex");
        }else{
            //hepsi
            li.classList.toggle("d-flex");
        }
    }
   
}
//Filtrelenen todoları gösterme
function updateFilterItems(){
    const activeFilter = document.querySelector(".btn-primary[item-filter]");

    filterItems(activeFilter.getAttribute("item-filter"));
}
//Tamamlanma kontrolü
function toggleCompleted(event){
    const li = event.target.parentElement;
    li.toggleAttribute("item-completed", event.target.checked);

    updateFilterItems();
    saveLocalStorage();
}
//To do silme işlemi
function removeItem(event){
    const li = event.target.parentElement;
    shoppingList.removeChild(li);
    saveLocalStorage();
    showAlert("success", "Successfully Deleted");
}
//To do düzenleme işlemi
function editItem(event) {
    const li = event.target.parentElement;
    const textElement = li.querySelector(".item-name"); // Öğe ismini içeren div

    // Eski metni sakla
    const oldText = textElement.textContent.trim();

    if (!li.hasAttribute("item-completed")) {
        textElement.contentEditable = true;
        textElement.focus();

        // İmleci metnin sonuna taşır
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(textElement);
        range.collapse(false); // False, imlecin range'in sonuna konumlandırılmasını sağlar
        selection.removeAllRanges();
        selection.addRange(range);
    }

    textElement.addEventListener("blur", () => {
        // Düzenlenmiş metni al ve küçük harfe çevir
        let newText = textElement.textContent.trim().toLowerCase();
        textElement.contentEditable = false;
        textElement.textContent = newText; // Başındaki ve sonundaki boşlukları kaldırır

        // Yeni metnin listede olup olmadığını kontrol et
        const itemId = li.getAttribute("item-id");
        if (isItemInList(newText, itemId)) {
            showAlert("warning", "This item already exists in the list!");
            // Önceki metni geri getir
            textElement.textContent = oldText;
        } else {
            showAlert("success", "Successfully Updated!");
            // Yerel depolamayı güncelle
            saveLocalStorage();
        }
    }, { once: true });
}

//Localstorage dan veri alma işlemi
function loadItemFromLocalStorage(id) {
    const items = JSON.parse(localStorage.getItem("shoppingItems")) || [];
    const item = items.find(item => item.id === id);
    if (item) {
        const li = shoppingList.querySelector(`[item-id="${id}"]`);
        li.querySelector(".item-name").textContent = item.name;
    }
}

function createListItem(item){
    //checkbox
    const input = document.createElement("input");
    input.type = "checkbox";
    input.classList.add = ("form-check-input");
    input.checked = item.compeleted;
    input.addEventListener("change", toggleCompleted);

    //item 
    const div = document.createElement("div");
    div.textContent = item.name;
    div.classList.add("item-name");

    //delete icon
    const deleteIcon = document.createElement("span");
    deleteIcon.classList.add("fs-3", "bi", "bi-x", "text-danger", "delete-icon");
    deleteIcon.addEventListener("click", removeItem);

    const editIcon = document.createElement("span");
    editIcon.classList.add("fs-3", "bi", "bi-pencil", "text-warning", "edit-icon");
    editIcon.addEventListener("click", editItem);

    //create li
     const li = document.createElement("li")
     li.setAttribute("item-id", item.id);
     li.classList.add("border", "rounded", "p-3", "mb-1");
     li.toggleAttribute("item-completed", item.compeleted);

     li.appendChild(input);
     li.appendChild(div);
     li.appendChild(deleteIcon);
     li.appendChild(editIcon);

     return li;

}
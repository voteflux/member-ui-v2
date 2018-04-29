function getElement(id)
{
    return document.getElementById(id);
}

function getElements(className)
{
    return document.getElementsByClassName(className);
}

function getElementValue(id)
{
    var element = getElement(id);
    
    if(element != null)
    {
        if(element.type == "checkbox")
        {
            return element.checked.toString();
        }
        else if(element.type == "text" || element.type == "password" || element.type == "select-one" || element.type == "select-multiple")
        {
            return element.value;
        }
        else
        {
            return element.textContent;
        }
    }

    return null;
}
        
function setElementValue(id, value)
{
    var element = getElement(id);
    
    if(element != null)
    {
        if(element.type == "checkbox")
        {
            element.checked = (value == "true");
        }
        else if(element.type == "text" || element.type == "password" || element.type == "select-one" || element.type == "select-multiple")
        {
            element.value = value;
        }
        else
        {
            element.textContent = value;
        }
    }
}

function clearElement(id)
{
    var element = getElement(id);
    
    if(element != null)
    {
        if(element.type == "checkbox")
        {
            element.checked = false;
        }
        else if(element.type == "text" || element.type == "password" || element.type == "select-one" || element.type == "select-multiple")
        {
            return element.value = "";
        }
        else
        {
            element.textContent = "";
        }
    }
}

function clearElements(className)
{
    var elements = getElements(className);
    
    for(var i = 0; i < elements.length; i++)
    {
        var element = elements[i];
        clearElement(element.id);
    }
}

function hideElement(id)
{
    var element = getElement(id);
    
    if(element != null)
    {
        element.style.display = "none";
    }
}

function showElement(id)
{
    var element = getElement(id);
    
    if(element != null)
    {
        element.style.display = "block";
    }
}

function showPopup(popupId)
{
	showElement(popupId);
	showElement("overlay");
}

function hidePopup(popupId)
{
	hideElement(popupId);
	hideElement("overlay");
}


function selectTab(containerId, tabId)
{
    var tabContainer = getElement(containerId)
    var tabList = tabContainer.getElementsByClassName("tab");
    for(var i = 0; i < tabList.length; i++)
    {
        var tab = tabList[i];
        var classes = tab.className.split(" ");
        var selectedContentId = null;
        var unselectedContentId = null;
        
        if(tabId == tab.id)
        {
            var index = classes.indexOf("unselectedTab");
            if(index >= 0)
            {
                classes.splice(index, 1);
                classes.push("selectedTab");
                selectedContentId = tab.id + "Content";
            }
        }
        else
        {
            var index = classes.indexOf("selectedTab");
            if(index >= 0)
            {
                classes.splice(index, 1);
                classes.push("unselectedTab");
                unselectedContentId = tab.id + "Content";
            }
        }
        
        tab.className = classes.join(" ");
        hideElement(unselectedContentId);
        showElement(selectedContentId);
    }
    
}
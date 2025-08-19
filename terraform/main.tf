provider "azurerm" {
    features {}
    subscription_id = var.subscription_id
}

resource "azurerm_resource_group" "resource_group" {
    for_each = var.environments
    name     = "codebots-${each.key}-ressource-group"
    location = "West Europe"
}

resource "azurerm_service_plan" "service_plan" {
    for_each = var.environments
    name                = "codebots-${each.key}-service-plan"
    location            = azurerm_resource_group.resource_group[each.key].location
    resource_group_name = azurerm_resource_group.resource_group[each.key].name
    os_type             = "Linux"
    sku_name            = "B1"
}

resource "azurerm_linux_web_app" "linux_web_app" {
    for_each = var.environments
    name                = "codebots-${each.key}-web-app"
    resource_group_name = azurerm_resource_group.resource_group[each.key].name
    location            = azurerm_service_plan.service_plan[each.key].location
    service_plan_id     = azurerm_service_plan.service_plan[each.key].id
    depends_on          = [azurerm_service_plan.service_plan]

    https_only          = true
    site_config {
        minimum_tls_version = "1.2"
        application_stack {
            node_version = "20-lts"
        }
    }

    app_settings = {
        SCM_DO_BUILD_DURING_DEPLOYMENT = "true"
    }
}

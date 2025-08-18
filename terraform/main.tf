provider "azurerm" {
    features {}
    subscription_id = var.subscription_id
}

resource "azurerm_resource_group" "resource_group" {
    name     = "codebots-ressource-group"
    location = "West Europe"
}

resource "azurerm_service_plan" "service_plan" {
    name                = "codebots-service-plan"
    location            = azurerm_resource_group.resource_group.location
    resource_group_name = azurerm_resource_group.resource_group.name
    os_type             = "Linux"
    sku_name            = "B1"
}

resource "azurerm_linux_web_app" "linux_web_app" {
    name                = "codebots-web-app"
    resource_group_name = azurerm_resource_group.resource_group.name
    location            = azurerm_service_plan.service_plan.location
    service_plan_id     = azurerm_service_plan.service_plan.id
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

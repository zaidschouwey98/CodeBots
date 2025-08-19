variable "subscription_id" {
    type    = string
    default = ""
}

variable "environments" {
    type    = set(string)
    default = ["dev", "stable"]
}

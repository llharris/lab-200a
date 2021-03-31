# These variables can be overidden

variable "weekday" {}

variable "pizza" {
  type = string
  default = "pepperoni"
  sensitive = true

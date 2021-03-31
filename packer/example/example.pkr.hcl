# These variables can be overidden

variable "weekday" {}

variable "pizza" {
  type = string
  default = "pepperoni"
  sensitive = true

# Locals (e.g constants)

locals {
  instance_ids = "{function.var.blah}"
}

# QEMU example

source "qemu" "example" {
  iso_url = ""
  iso_checksum = ""
  output_directory = "output_example"
  shutdown_command = ""
  disk_size = "${bootdisk.size}"
  format = "qcow2"
  accelerator = "kvm"
  http_directory = ""
  ssh_username = "root"
  ssh_password = "password"
  ssh_timeout = "30m"
  ### other options:
  cpus = int
  headless = boolean
  memory = megabytes
  net-bridge = "host-bridge"
  vm_name = "name"

# vSphere ISO example - requires a vcenter and uses it's API

source "vsphere-iso" "example" {
  CPUs = 1
  RAM = 1024
  RAM_reserve_all = true
  boot_command = some weird shit
  disk_controller_type = ...

# VMware ISO  

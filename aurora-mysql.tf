# Create a new RDS instance

module "rds_aurora" {
  # source                  = "git@mygitserver_here:terraform_modules/aws_rds_aurora.git?ref=v2.20.0"
  source  = "terraform-aws-modules/rds-aurora/aws"
  version = "5.2.0"

  name                  = var.instance_name
  engine                = var.engine
  engine_version        = var.engine_version
  instance_type         = var.instance_type
  instance_type_replica = var.instance_type_replica

  vpc_id                = var.vpc_id
  db_subnet_group_name  = var.db_subnet_group_name
  create_security_group = var.create_security_group
  allowed_cidr_blocks   = var.allowed_cidr_blocks
  # vpc_security_group_ids = var.vpc_security_group_ids
  vpc_security_group_ids = compact(concat(aws_security_group.this.*.id, var.vpc_security_group_ids))


  replica_count                       = var.replica_count
  instances_parameters                = var.instances_parameters
  iam_database_authentication_enabled = var.iam_database_authentication_enabled
  username                            = var.username
  password                            = var.password
  # password                            = random_password.master.result
  create_random_password              = var.create_random_password

  apply_immediately   = true
  skip_final_snapshot = true

  db_parameter_group_name         = aws_db_parameter_group.example.id
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.example.id
  enabled_cloudwatch_logs_exports = var.enabled_cloudwatch_logs_exports

  snapshot_identifier             = var.snapshot_identifier

  tags = merge(
    local.terraform_tags,
    {
      Name = var.instance_name
    },
  )
}

resource "aws_db_parameter_group" "example" {
  name        = "${var.instance_name}-${local.nodot_aurora_parameter_group_name}-parameter-group"
  family      = var.rds_aurora_parameter_group_name
  description = "${var.instance_name}-${local.nodot_aurora_parameter_group_name}-parameter-group"
  tags        = local.terraform_tags
}

resource "aws_rds_cluster_parameter_group" "example" {
  name        = "${var.instance_name}-${local.nodot_aurora_parameter_group_name}-cluster-parameter-group"
  family      = var.rds_aurora_parameter_group_name
  description = "${var.instance_name}-${local.nodot_aurora_parameter_group_name}-cluster-parameter-group"
  tags        = local.terraform_tags

  # parameter {
  #   name  = "character_set_server"
  #   value = "utf8"
  # }

  # parameter {
  #   name  = "character_set_client"
  #   value = "utf8"
  # }

  # parameter {
  #   name  = "character_set_connection"
  #   value = "utf8"
  # }

  # parameter {
  #   name  = "character_set_database"
  #   value = "utf8"
  # }

  # parameter {
  #   name  = "collation_connection"
  #   value = "utf8_unicode_ci"
  # }

  # parameter {
  #   name  = "collation_server"
  #   value = "utf8_unicode_ci"
  # }

}


resource "random_password" "master" {
  length = 10
}


################################################################################
# Security Group
################################################################################


resource "aws_security_group" "this" {
  count = var.create_cluster && var.create_security_group ? 1 : 0

  name_prefix = "${var.instance_name}-"
  vpc_id      = var.vpc_id
  description = coalesce(var.security_group_description, "Control traffic to/from RDS Aurora ${var.instance_name}")

    tags = merge(
    local.terraform_tags,
    {
      Name = var.instance_name
    },
  )
}

resource "aws_security_group_rule" "default_ingress" {
  count = var.create_cluster && var.create_security_group ? length(var.allowed_security_groups) : 0

  description = "From allowed SGs"

  type                     = "ingress"
  from_port                = element(concat(["${module.rds_aurora.rds_cluster_port}"], [""]), 0)
  to_port                  = element(concat(["${module.rds_aurora.rds_cluster_port}"], [""]), 0)
  protocol                 = "tcp"
  source_security_group_id = element(var.allowed_security_groups, count.index)
  security_group_id        = local.rds_security_group_id
}

# resource "aws_security_group_rule" "cidr_ingress" {
#   count = var.create_cluster && var.create_security_group && length(var.allowed_cidr_blocks) > 0 ? 1 : 0

#   description = "From allowed CIDRs"

#   type              = "ingress"
#   from_port         = element(concat(module.rds_aurora.rds_cluster_port, [""]), 0)
#   to_port           = element(concat(module.rds_aurora.rds_cluster_port, [""]), 0)
#   protocol          = "tcp"
#   cidr_blocks       = var.allowed_cidr_blocks
#   security_group_id = local.rds_security_group_id
# }
"""initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "test_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column(
            "file_type",
            sa.Enum("csv", "json", "asc", name="filetype"),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum("pending", "processing", "completed", "failed", name="runstatus"),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("record_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("duration_ms", sa.Float(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_test_runs_id", "test_runs", ["id"])

    op.create_table(
        "trace_records",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("test_run_id", sa.Integer(), nullable=False),
        sa.Column("timestamp_ms", sa.Float(), nullable=False),
        sa.Column("signal_name", sa.String(255), nullable=False),
        sa.Column("value", sa.Float(), nullable=True),
        sa.Column("raw_value", sa.String(255), nullable=True),
        sa.Column("unit", sa.String(50), nullable=True),
        sa.Column("bus_channel", sa.String(50), nullable=True),
        sa.Column("message_id", sa.String(50), nullable=True),
        sa.Column("raw_data", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["test_run_id"], ["test_runs.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_trace_records_id", "trace_records", ["id"])
    op.create_index("ix_trace_records_test_run_id", "trace_records", ["test_run_id"])
    op.create_index("ix_trace_records_timestamp_ms", "trace_records", ["timestamp_ms"])
    op.create_index("ix_trace_records_signal_name", "trace_records", ["signal_name"])

    op.create_table(
        "analysis_results",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("test_run_id", sa.Integer(), nullable=False),
        sa.Column(
            "check_type",
            sa.Enum(
                "range_violation",
                "timing_violation",
                "missing_signal",
                "anomaly",
                "statistics",
                name="checktype",
            ),
            nullable=False,
        ),
        sa.Column(
            "severity",
            sa.Enum("info", "warning", "error", "critical", name="severity"),
            nullable=False,
        ),
        sa.Column("signal_name", sa.String(255), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("timestamp_ms", sa.Float(), nullable=True),
        sa.Column("value", sa.Float(), nullable=True),
        sa.Column("threshold_min", sa.Float(), nullable=True),
        sa.Column("threshold_max", sa.Float(), nullable=True),
        sa.Column("stat_mean", sa.Float(), nullable=True),
        sa.Column("stat_std", sa.Float(), nullable=True),
        sa.Column("stat_min", sa.Float(), nullable=True),
        sa.Column("stat_max", sa.Float(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(["test_run_id"], ["test_runs.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_analysis_results_id", "analysis_results", ["id"])
    op.create_index(
        "ix_analysis_results_test_run_id", "analysis_results", ["test_run_id"]
    )


def downgrade() -> None:
    op.drop_table("analysis_results")
    op.drop_table("trace_records")
    op.drop_table("test_runs")

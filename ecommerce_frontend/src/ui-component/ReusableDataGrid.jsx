import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// material-ui
import {
  Grid,
  Button,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Typography,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "react-hot-toast";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";

// project imports
import MainCard from "../ui-component/cards/MainCard";
import SecondaryAction from "../ui-component/cards/CardSecondaryAction";
// import { gridSpacing } from "..

const ActionWrapper = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "4px",
  padding: "4px",
});

const HeaderSearchWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
  marginLeft: "auto",
  // Add styling to align items correctly in the header
  "@media (max-width: 600px)": {
    marginLeft: 0,
    marginTop: "16px",
    justifyContent: "space-between",
  },
});

// Replace old DataGridMobileCard with a column/field-aware version
const DataGridMobileCard = ({
  row,
  columns,
  onView,
  onEdit,
  onDelete,
  onEnroll,
  hasActions,
}) => {
  const getCellValue = (col) => {
    // mimic DataGrid valueGetter
    try {
      if (typeof col.valueGetter === "function") {
        return col.valueGetter({ row, value: row?.[col.field] });
      }
    } catch {
      /* ignore valueGetter errors */
    }
    return row?.[col.field] ?? "";
  };

  const displayColumns = columns.filter((c) => c.field !== "actions");

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.5,
        mb: 1.5,
        bgcolor: "background.paper",
      }}
    >
      {displayColumns.map((col) => (
        <Box
          key={col.field}
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 1,
            py: 0.5,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ minWidth: 110 }}
          >
            {col.headerName || col.field}
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "right", flex: 1 }}>
            {String(getCellValue(col) ?? "")}
          </Typography>
        </Box>
      ))}

      {hasActions && (
        <ActionWrapper sx={{ justifyContent: "flex-end", pt: 0.5 }}>
          {onView && (
            <Tooltip title="View">
              <IconButton size="small" color="info" onClick={onView}>
                <ViewIcon />
              </IconButton>
            </Tooltip>
          )}
          {onEnroll && (
            <Tooltip title="Enroll">
              <IconButton size="small" color="secondary" onClick={onEnroll}>
                <PersonAddIcon />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton size="small" color="primary" onClick={onEdit}>
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={onDelete}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </ActionWrapper>
      )}
    </Box>
  );
};

// Remove the broken isMobile init. Add a safe breakpoint watcher.
const MOBILE_BREAKPOINT = 768;
const ReusableDataGrid = ({
  title,
  fetchUrl,
  columns: propColumns,
  editUrl,
  deleteUrl,
  addActionUrl,
  EnrollActionUrl,
  viewUrl,
  // filters disabled in simple mode
  data: clientSideData = [],
  // simplified component ignores server fetching & permissions
  customActionsHeader = [],
  searchPlaceholder = "Search...",
  showSearch = true,
  showRefresh = true,
  // showFilters disabled in simple mode
  pageSizeOptions = [5, 10, 25, 50],
  defaultPageSize = 10,
  height = 600,
  transformData = null,
  onRowClick = null,
  selectionModel = null,
  onSelectionModelChange = null,
  checkboxSelection = false,
  disableSelectionOnClick = false,
  getRowClassName = null,
  customToolbar = null,
  loadingOverlay = null,
  errorOverlay = null,
  // SCD filters disabled in simple mode
  customActions = [],
  getRowId: getRowIdProp = (row) => row.id,
  schoolNameMap = {},
  classNameMap = {},
  divisionNameMap = {},
  // sortBy left for API compatibility, unused in simple mode
  onDataChange = null,
  onDelete, // optional callback for delete
}) => {
  const navigate = useNavigate();
  // const [searchText, setSearchText] = useState('');
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.innerWidth < MOBILE_BREAKPOINT
      : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [loading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: defaultPageSize,
  });
  // rowCount derived from gridData
  const [searchText, setSearchText] = useState("");
  // const [selectedRow, setSelectedRow] = useState(null);
  // gridFilters not used in simple mode
  const [gridData, setGridData] = useState([]);
  // simplified: no user/permission/SCD dependencies

  // Sync external filters prop with internal gridFilters state

  // removed unused transformDocumentData helper

  // Use a ref to store the latest filters without triggering a re-render
  // no external filters in simple mode

  // stable key for gridFilters to use in hook deps
  // removed unused gridFiltersKey memo

  // Simple client-side filtering only
  const recomputeData = useCallback(() => {
    const filteredData = clientSideData.filter((item) => {
      if (!searchText) return true;
      try {
        return JSON.stringify(item)
          .toLowerCase()
          .includes(searchText.toLowerCase());
      } catch {
        return false;
      }
    });
    const transformedData = transformData
      ? filteredData.map(transformData)
      : filteredData;
    setGridData(transformedData);
    if (onDataChange) onDataChange(transformedData);
  }, [clientSideData, searchText, transformData, onDataChange]);

  // Filters change handler is unnecessary in simple mode

  useEffect(() => {
    recomputeData();
  }, [recomputeData]);

  const handleOnClickDelete = async (id) => {
    if (!onDelete) return;
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await onDelete(id);
        toast.success("Item deleted successfully!");
        recomputeData();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete item.");
      }
    }
  };

  const handleOnClickView = (id) => {
    navigate(`${viewUrl}/${id}`);
  };
  const handleOnClickEnrollActionUrl = (id) => {
    navigate(`${EnrollActionUrl}/${id}`);
  };
  const handleSearch = (event) => {
    const newSearchText = event.target.value;
    setSearchText(newSearchText);
  };

  const handleRefresh = () => {
    setSearchText("");
    setPaginationModel({ page: 0, pageSize: defaultPageSize });
    recomputeData();
  };

  const handleRowClick = (params) => {
    if (onRowClick) {
      onRowClick(params);
    }
    // setSelectedRow(params.row);
  };

  const hasActions =
    editUrl ||
    deleteUrl ||
    viewUrl ||
    EnrollActionUrl ||
    customActions.length > 0;

  const actionsColumn = hasActions
    ? {
        field: "actions",
        headerName: "Actions",
        width: 160,
        sortable: false,
        filterable: false,
        renderCell: (params) => {
          const hasCustomActions = customActions.length > 0;

          if (hasCustomActions) {
            return (
              <ActionWrapper>
                {customActions.map((action, index) => {
                  // if (action.permission && !hasPermission(permissions, entityName, action.permission)) {
                  //   return null;
                  // }

                  return (
                    <Tooltip key={index} title={action.tooltip || action.label}>
                      <IconButton
                        size="small"
                        color={action.color || "primary"}
                        onClick={() => action.onClick(params.row)}
                        sx={{
                          "&:hover": {
                            backgroundColor: `rgba(${
                              action.color === "error"
                                ? "244, 67, 54"
                                : action.color === "info"
                                ? "33, 150, 243"
                                : "25, 118, 210"
                            }, 0.1)`,
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        {action.icon}
                      </IconButton>
                    </Tooltip>
                  );
                })}

                {/* Removed unused 'More' menu button */}
              </ActionWrapper>
            );
          }

          return (
            <ActionWrapper>
              {viewUrl && (
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    color="info"
                    onClick={() => handleOnClickView(params.row.id)}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(33, 150, 243, 0.1)",
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
              )}
              {EnrollActionUrl && (
                <Tooltip title="Enroll">
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => handleOnClickEnrollActionUrl(params.row.id)}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(156, 39, 176, 0.1)",
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <PersonAddIcon />
                  </IconButton>
                </Tooltip>
              )}
              {editUrl && (
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => navigate(`${editUrl}/${params.row.id}`)}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.1)",
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
              {deleteUrl && onDelete && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleOnClickDelete(params.row.id)}
                    sx={{
                      "&:hover": {
                        backgroundColor: "rgba(244, 67, 54, 0.1)",
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </ActionWrapper>
          );
        },
      }
    : null;
  // Function to get the correct name for a given ID
  const getNameForId = (id, map) => map[id] || "N/A";

  const processedColumns = propColumns.map((col) => {
    // If a custom valueFormatter is already defined, don't override it
    if (col.valueFormatter || col.renderCell) {
      return col;
    }
    // Simple mapping using provided name maps only
    if (col.field === "schoolId") {
      return {
        ...col,
        headerName: col.headerName || "School",
        valueFormatter: (params) => getNameForId(params.value, schoolNameMap),
      };
    }
    if (col.field === "classId") {
      return {
        ...col,
        headerName: col.headerName || "Class",
        valueFormatter: (params) => getNameForId(params.value, classNameMap),
      };
    }
    if (col.field === "divisionId") {
      return {
        ...col,
        headerName: col.headerName || "Division",
        valueFormatter: (params) => getNameForId(params.value, divisionNameMap),
      };
    }

    return col;
  });

  const columns = hasActions
    ? [...processedColumns, actionsColumn]
    : processedColumns;
  const secondaryHeader = (
    <Grid
      container
      spacing={2}
      alignItems="center"
      padding={2}
      justifyContent="flex-end"
    >
      {customActionsHeader && <Grid item>{customActionsHeader}</Grid>}
    </Grid>
  );
  // Header content to be passed to MainCard's secondary prop
  const headerSearchControls = (
    <HeaderSearchWrapper>
      {showSearch && (
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={searchText}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
      )}
      {showRefresh && (
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      )}
      {/* Filters chip hidden in simple mode */}
      {addActionUrl && (
        <SecondaryAction icon={<AddIcon />} link={addActionUrl} />
      )}
    </HeaderSearchWrapper>
  );

  return (
    <MainCard
      title={
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          <Typography variant="h3" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {headerSearchControls}
        </Box>
      }
      secondary={secondaryHeader}
      contentSX={{ p: 1 }}
    >
      {customToolbar && customToolbar()}

      {/* Simplified: hide SCD filter container in simple mode */}

      <Grid
        container
        //  spacing={gridSpacing}
      >
        <Grid item xs={12}>
          {isMobile ? (
            // Mobile: card list view
            <Box>
              {gridData.map((row) => (
                <DataGridMobileCard
                  key={getRowIdProp(row)}
                  row={row}
                  columns={columns}
                  hasActions={hasActions}
                  onView={viewUrl ? () => handleOnClickView(row.id) : undefined}
                  onEdit={
                    editUrl ? () => navigate(`${editUrl}/${row.id}`) : undefined
                  }
                  onDelete={
                    deleteUrl ? () => handleOnClickDelete(row.id) : undefined
                  }
                  onEnroll={
                    EnrollActionUrl
                      ? () => handleOnClickEnrollActionUrl(row.id)
                      : undefined
                  }
                />
              ))}

              {/* Simple pager for mobile */}
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  disabled={paginationModel.page === 0 || loading}
                  onClick={() =>
                    setPaginationModel((p) => ({
                      ...p,
                      page: Math.max(0, p.page - 1),
                    }))
                  }
                >
                  Prev
                </Button>
                <Typography variant="caption">
                  Page {paginationModel.page + 1}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  disabled={loading}
                  onClick={() =>
                    setPaginationModel((p) => ({ ...p, page: p.page + 1 }))
                  }
                >
                  Next
                </Button>
              </Box>
            </Box>
          ) : (
            // Desktop: DataGrid table
            <Box sx={{ height, width: "100%" }}>
              <DataGrid
                rows={gridData}
                columns={columns}
                loading={loading}
                pageSizeOptions={pageSizeOptions}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                paginationMode={fetchUrl ? "server" : "client"}
                getRowId={getRowIdProp}
                onRowClick={onRowClick || handleRowClick}
                selectionModel={selectionModel}
                onSelectionModelChange={onSelectionModelChange}
                checkboxSelection={checkboxSelection}
                disableSelectionOnClick={disableSelectionOnClick}
                getRowClassName={getRowClassName}
                loadingOverlay={loadingOverlay}
                errorOverlay={errorOverlay}
                sx={{
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                    cursor: onRowClick ? "pointer" : "default",
                  },
                  "& .MuiDataGrid-row.Mui-selected": {
                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                  },
                  "& .MuiDataGrid-row.Mui-selected:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.12)",
                  },
                }}
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </MainCard>
  );
};

import PropTypes from "prop-types";

ReusableDataGrid.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string,
  fetchUrl: PropTypes.string,
  editUrl: PropTypes.string,
  deleteUrl: PropTypes.string,
  addActionUrl: PropTypes.string,
  EnrollActionUrl: PropTypes.string,
  viewUrl: PropTypes.string,
  filters: PropTypes.object,
  data: PropTypes.array,
  isPostRequest: PropTypes.bool,
  requestMethod: PropTypes.string,
  sendBodyOnGet: PropTypes.bool,
  entityName: PropTypes.string,
  customActionsHeader: PropTypes.node,
  searchPlaceholder: PropTypes.string,
  showSearch: PropTypes.bool,
  showRefresh: PropTypes.bool,
  showFilters: PropTypes.bool,
  pageSizeOptions: PropTypes.array,
  defaultPageSize: PropTypes.number,
  height: PropTypes.number,
  transformData: PropTypes.func,
  onRowClick: PropTypes.func,
  selectionModel: PropTypes.any,
  onSelectionModelChange: PropTypes.func,
  checkboxSelection: PropTypes.bool,
  disableSelectionOnClick: PropTypes.bool,
  getRowClassName: PropTypes.func,
  customToolbar: PropTypes.func,
  loadingOverlay: PropTypes.node,
  errorOverlay: PropTypes.node,
  showSchoolFilter: PropTypes.bool,
  showClassFilter: PropTypes.bool,
  showDivisionFilter: PropTypes.bool,
  enableFilters: PropTypes.bool,
  customActions: PropTypes.array,
  getRowId: PropTypes.func,
  schoolNameMap: PropTypes.object,
  classNameMap: PropTypes.object,
  divisionNameMap: PropTypes.object,
  sortBy: PropTypes.string,
  onDataChange: PropTypes.func,
};

export default ReusableDataGrid;

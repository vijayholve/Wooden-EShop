import React, { useState, useEffect, useCallback, useRef } from "react";
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
  // server fetch options
  isPostRequest = false,
  requestMethod,
  // external trigger to reload server data
  reloadKey = 0,
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

  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    // DataGrid paginationModel is zero-based (page: 0 is first page)
    page: 0,
    pageSize: defaultPageSize,
  });

  // Stable handler to update pagination only when values actually change.
  // Use functional update so the handler identity can be stable (no deps).
  const handlePaginationModelChange = useCallback((newModel) => {
    if (!newModel) return;
    setPaginationModel((prev) => {
      const newPage =
        typeof newModel.page === "number" ? newModel.page : prev.page;
      const newPageSize =
        typeof newModel.pageSize === "number"
          ? newModel.pageSize
          : prev.pageSize;
      if (newPage === prev.page && newPageSize === prev.pageSize) return prev;
      return { page: newPage, pageSize: newPageSize };
    });
  }, []);
  // rowCount derived from gridData
  const [searchText, setSearchText] = useState("");
  // const [selectedRow, setSelectedRow] = useState(null);
  // gridFilters not used in simple mode
  const [gridData, setGridData] = useState([]);
  // server-side total rows (used when fetchUrl provided)
  const [serverTotalCount, setServerTotalCount] = useState(0);
  // keep a ref to the latest onDataChange so it doesn't trigger recomputeData when parent passes a new function
  const onDataChangeRef = React.useRef(onDataChange);
  React.useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);
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
    // Avoid updating state if data didn't change (shallow compare by row id)
    const prev = prevGridDataRef.current || [];
    const same =
      prev.length === transformedData.length &&
      prev.every(
        (r, i) => getRowIdProp(r) === getRowIdProp(transformedData[i])
      );
    if (!same) setGridData(transformedData);
    if (onDataChangeRef.current) onDataChangeRef.current(transformedData);
  }, [clientSideData, searchText, transformData, getRowIdProp]);

  // keep a ref of the previous gridData so recomputeData can compare without
  // adding gridData to its dependency list (avoids update loops)
  const prevGridDataRef = useRef([]);
  useEffect(() => {
    prevGridDataRef.current = gridData;
  }, [gridData]);

  // Filters change handler is unnecessary in simple mode

  useEffect(() => {
    recomputeData();
  }, [recomputeData]);

  // Server-side fetching when fetchUrl is provided
  useEffect(() => {
    if (!fetchUrl) return;

    let cancelled = false;
    const controller = new AbortController();

    const doFetch = async () => {
      setLoading(true);
      try {
        const pageToSend = (paginationModel?.page ?? 0) + 1; // server expects 1-based page
        const sizeToSend = paginationModel?.pageSize ?? defaultPageSize;

        const method =
          (typeof requestMethod === "string" && requestMethod.toUpperCase()) ||
          (isPostRequest ? "POST" : "GET");

        let res;
        console.log("Fetching data for ReusableDataGrid", { fetchUrl, method });
        if (method === "GET") {
          // build query params
          const params = new URLSearchParams();
          params.set("page", String(pageToSend));
          params.set("size", String(sizeToSend));
          if (searchText) params.set("search", searchText);
          const url = fetchUrl.includes("?")
            ? `${fetchUrl}&${params}`
            : `${fetchUrl}?${params}`;
          res = await fetch(url, { method: "GET", signal: controller.signal });
        } else if (method === "POST") {
          const body = { page: pageToSend, size: sizeToSend };
          if (searchText) body.search = searchText;
          res = await fetch(fetchUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
        } else {
          const body = { page: pageToSend, size: sizeToSend };
          if (searchText) body.search = searchText;
          res = await fetch(fetchUrl, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          console.log("Fetched data for ReusableDataGrid", { res });
        }

        if (cancelled) return;
        if (!res.ok) {
          // try to read json error
          let errText = await res.text();
          console.error(
            "Server returned error for fetchUrl",
            res.status,
            errText
          );
          setGridData([]);
          setServerTotalCount(0);
          setLoading(false);
          return;
        }

        const json = await res.json();

        // Response can be array or paginated object
        if (Array.isArray(json)) {
          setGridData(transformData ? json.map(transformData) : json);
          setServerTotalCount(json.length);
        } else if (json.results && Array.isArray(json.results)) {
          setGridData(
            transformData ? json.results.map(transformData) : json.results
          );
          setServerTotalCount(
            typeof json.count === "number" ? json.count : json.results.length
          );
        } else if (json.data && Array.isArray(json.data)) {
          setGridData(transformData ? json.data.map(transformData) : json.data);
          setServerTotalCount(
            typeof json.total === "number" ? json.total : json.data.length
          );
        } else {
          // fallback: try to find an array in the response
          const arr = Object.values(json).find((v) => Array.isArray(v));
          if (arr) {
            setGridData(transformData ? arr.map(transformData) : arr);
            setServerTotalCount(arr.length);
          } else {
            // unknown format
            console.warn("Unexpected fetchUrl response shape", json);
            setGridData([]);
            setServerTotalCount(0);
          }
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to fetch data for ReusableDataGrid", err);
        setGridData([]);
        setServerTotalCount(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    doFetch();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // paginationModel and searchText are intentional deps
  }, [
    fetchUrl,
    paginationModel.page,
    paginationModel.pageSize,
    searchText,
    requestMethod,
    isPostRequest,
    transformData,
    defaultPageSize,
    reloadKey,
  ]);

  const handleOnClickDelete = React.useCallback(
    async (id) => {
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
    },
    [onDelete, recomputeData]
  );

  const handleOnClickView = React.useCallback(
    (id) => {
      navigate(`${viewUrl}/${id}`);
    },
    [navigate, viewUrl]
  );
  const handleOnClickEnrollActionUrl = React.useCallback(
    (id) => {
      navigate(`${EnrollActionUrl}/${id}`);
    },
    [navigate, EnrollActionUrl]
  );
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

  // helper to map id to name if maps are provided
  const getNameForId = (id, map) => (map && map[id] ? map[id] : id);

  const processedColumns = React.useMemo(() => {
    return propColumns.map((col) => {
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
          valueFormatter: (params) =>
            getNameForId(params.value, divisionNameMap),
        };
      }

      return col;
    });
  }, [propColumns, schoolNameMap, classNameMap, divisionNameMap]);

  const columns = React.useMemo(() => {
    if (!hasActions) return processedColumns;

    const actionCol = {
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
              {customActions.map((action, index) => (
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
              ))}
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
    };

    return [...processedColumns, actionCol];
  }, [
    processedColumns,
    hasActions,
    customActions,
    viewUrl,
    EnrollActionUrl,
    editUrl,
    deleteUrl,
    onDelete,
    navigate,
    handleOnClickDelete,
    handleOnClickEnrollActionUrl,
    handleOnClickView,
  ]);
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
                {...(fetchUrl ? { rowCount: serverTotalCount } : {})}
                pageSizeOptions={pageSizeOptions}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationModelChange}
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

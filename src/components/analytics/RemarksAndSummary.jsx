import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import ShamsiDatePicker from '../common/ShamsiDatePicker';
import { formatShamsiDate, getCurrentShamsiDateStr } from '../../utils/persianDate';
import './RemarksAndSummary.css';

// Predefined keyword groups for common drilling operations
const DEFAULT_KEYWORD_GROUPS = [
  {
    id: 'problems',
    name: 'PROBLEMS',
    description: 'Drilling Problems',
    and_keywords: '',
    or_keywords: 'STUCK, LOST CIRCULATION, KICK, BLOW OUT, FISHING, TWIST OFF, WASHOUT, HOLE PROBLEM',
    not_keywords: '',
    sql_code: ''
  },
  {
    id: 'wash_ream',
    name: 'WASH AND REAM',
    description: 'Wash and Ream Operations',
    and_keywords: '',
    or_keywords: 'WASH AND REAM, W&R, BACK REAM, WASH & REAM, WASH&REAM, W & R, WIPER TRIP',
    not_keywords: '',
    sql_code: ''
  },
  {
    id: 'casing',
    name: 'CASING',
    description: 'Casing Operations',
    and_keywords: '',
    or_keywords: 'RUN CASING, CASING, CEMENT, CMT, SHOE, FLOAT COLLAR, CENTRALIZER',
    not_keywords: '',
    sql_code: ''
  },
  {
    id: 'logging',
    name: 'LOGGING',
    description: 'Logging Operations',
    and_keywords: '',
    or_keywords: 'LOG, LOGGING, LWD, MWD, WIRELINE, E-LOG, GAMMA RAY, RESISTIVITY',
    not_keywords: '',
    sql_code: ''
  },
  {
    id: 'testing',
    name: 'TESTING',
    description: 'Well Testing',
    and_keywords: '',
    or_keywords: 'DST, DRILL STEM TEST, FIT, LOT, LEAK OFF, FORMATION TEST, PRESSURE TEST',
    not_keywords: '',
    sql_code: ''
  },
  {
    id: 'tripping',
    name: 'TRIPPING',
    description: 'Tripping Operations',
    and_keywords: '',
    or_keywords: 'POOH, RIH, TRIP, PULL OUT, RUN IN, STAND, CONNECTION',
    not_keywords: '',
    sql_code: ''
  },
  {
    id: 'mud',
    name: 'MUD OPERATIONS',
    description: 'Mud Related Operations',
    and_keywords: '',
    or_keywords: 'MUD, WEIGHT UP, CIRCULATE, CONDITION, PILL, SWEEP, DISPLACE',
    not_keywords: '',
    sql_code: ''
  },
  {
    id: 'npt',
    name: 'NPT',
    description: 'Non-Productive Time',
    and_keywords: '',
    or_keywords: 'WAIT, REPAIR, DOWN, BREAKDOWN, NPT, STAND BY, DELAY',
    not_keywords: '',
    sql_code: ''
  }
];

// All possible hole sizes (for reference)
const ALL_HOLE_SIZES = [
  '36', '26', '17-1/2', '12-1/2', '12-1/4', '8-3/4', '8-1/2', '8-3/8',
  '8-3/32', '7', '6-3/32', '6-1/8', '6', '5-7/8', '4-1/4', '4-1/8', '2-3/4'
];

// All operation code groups - selecting a name searches all related codes
const ALL_OPERATION_CODE_GROUPS = [
  { name: 'Drilling', codes: ['DRLG', 'DRL', 'DRG'] },
  { name: 'Drilling on Tour', codes: ['DOT'] },
  { name: 'Directional Drilling', codes: ['DD'] },
  { name: 'Rig Up', codes: ['RU'] },
  { name: 'Rig Down', codes: ['RD', 'RDN'] },
  { name: 'Rig Repair', codes: ['RR'] },
  { name: 'Trip In', codes: ['TIN'] },
  { name: 'Trip Out', codes: ['TOV', 'POV', 'POR'] },
  { name: 'Casing', codes: ['CSG'] },
  { name: 'Cementing', codes: ['CMT', 'CMC'] },
  { name: 'Wait on Cement', codes: ['WOC'] },
  { name: 'Hole Conditioning', codes: ['HC'] },
  { name: 'Ream', codes: ['RM'] },
  { name: 'Circulating', codes: ['CIR', 'CIC'] },
  { name: 'Mud Operations', codes: ['MUD'] },
  { name: 'Completion', codes: ['COMP'] },
  { name: 'Workover', codes: ['WO'] },
  { name: 'Suspend', codes: ['SUS'] },
  { name: 'Logging', codes: ['LOG', 'MLG'] },
  { name: 'Testing', codes: ['TEST', 'LOT'] },
  { name: 'Survey', codes: ['SRV'] },
  { name: 'Coring', codes: ['COR'] },
  { name: 'BOP', codes: ['BOP', 'BOPW'] },
  { name: 'Fishing', codes: ['FISH', 'FSH', 'JF'] },
  { name: 'Stuck Pipe', codes: ['STK', 'STRK'] },
  { name: 'Lost Circulation', codes: ['LOC'] },
  { name: 'Milling', codes: ['MILL'] },
  { name: 'Night Time', codes: ['NT'] },
  { name: 'Wait on Tool', codes: ['WTO'] },
  { name: 'Wait on Weather', codes: ['WOW'] },
  { name: 'Torque', codes: ['TRQ'] },
  { name: 'Other', codes: ['OTH', 'ACD', 'BHAF', 'BHB', 'BHS', 'CAT', 'CTP', 'DCT', 'DFS', 'DHO', 'DMR', 'DMS', 'DSG', 'HTL', 'LDP', 'OHT', 'PAG', 'RCS', 'RDR', 'RO', 'ROE', 'ROP', 'RW', 'S', 'SAC', 'TF', 'TH', 'WC', 'WCT'] }
];

const RemarksAndSummary = ({
  wells = [],
  dateRange,
  setDateRange,
  selectedWells,
  setSelectedWells
}) => {
  // State for filters
  const [selectedHoleSizes, setSelectedHoleSizes] = useState([]);
  const [selectedOperationCodes, setSelectedOperationCodes] = useState([]);
  const [selectedKeywordGroups, setSelectedKeywordGroups] = useState([]);

  // Custom keyword search
  const [andKeywords, setAndKeywords] = useState('');
  const [orKeywords, setOrKeywords] = useState('');
  const [notKeywords, setNotKeywords] = useState('');

  // Data states
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const PAGE_SIZE_OPTIONS = [25, 50, 100, 'All'];

  // View options
  const [viewMode, setViewMode] = useState('remarks'); // 'remarks' or 'summary'
  const [showTimeIncluded, setShowTimeIncluded] = useState(true);

  // Selected report for detail view
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentReportIndex, setCurrentReportIndex] = useState(-1);

  // Fields list
  const [fields, setFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);

  // Rigs list
  const [rigs, setRigs] = useState([]);
  const [selectedRigs, setSelectedRigs] = useState([]);

  // Muds list
  const [muds, setMuds] = useState([]);
  const [selectedMuds, setSelectedMuds] = useState([]);

  // Dynamic filter options based on selected wells
  const [availableHoleSizes, setAvailableHoleSizes] = useState([]);
  const [availableOperationCodes, setAvailableOperationCodes] = useState([]);
  const [availableOperationGroups, setAvailableOperationGroups] = useState([]);

  // Keyword groups management (Unit2 style)
  const [keywordGroups, setKeywordGroups] = useState(DEFAULT_KEYWORD_GROUPS);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    and_keywords: '',
    or_keywords: '',
    not_keywords: '',
    sql_code: ''
  });

  // Fetch fields and rigs on mount
  useEffect(() => {
    fetchFieldsAndRigs();
    fetchKeywordGroups();
  }, []);

  // Fetch filter options when wells change
  useEffect(() => {
    fetchFilterOptionsForWells();
  }, [wells, selectedWells]);

  const fetchFilterOptionsForWells = async () => {
    try {
      // Determine which wells to use for filtering
      const wellsToFilter = selectedWells.length > 0 ? selectedWells : (wells.length > 0 ? wells : null);

      // Call RPC function to get filter options
      const { data, error } = await supabase
        .rpc('get_filter_options_for_wells', { well_names: wellsToFilter });

      if (error) {
        console.error('Error fetching filter options:', error);
        // Fallback to showing all options
        setAvailableHoleSizes(ALL_HOLE_SIZES);
        setAvailableOperationGroups(ALL_OPERATION_CODE_GROUPS);
        return;
      }

      if (data && data.length > 0) {
        const options = data[0];

        // Set available hole sizes (filter to only include known sizes for better UX)
        const holeSizes = options.hole_sizes || [];
        setAvailableHoleSizes(holeSizes.filter(Boolean).sort((a, b) => {
          // Sort by numeric value (handle fractions like "1/2", "3/4")
          const parseFraction = (frac) => {
            if (!frac || typeof frac !== 'string') return 0;
            const parts = frac.split('/');
            if (parts.length === 2) {
              return parseFloat(parts[0]) / parseFloat(parts[1]);
            }
            return parseFloat(frac) || 0;
          };
          const parseSize = (s) => {
            if (!s) return 0;
            if (s.includes('-')) {
              const parts = s.split('-');
              return parseFloat(parts[0]) + parseFraction(parts[1]);
            }
            return parseFloat(s) || 0;
          };
          return parseSize(b) - parseSize(a); // Largest first
        }));

        // Set available operation codes
        const opCodes = options.operation_codes || [];
        setAvailableOperationCodes(opCodes);

        // Filter operation groups to only show those with codes that exist in the data
        const availableGroups = ALL_OPERATION_CODE_GROUPS.filter(group =>
          group.codes.some(code => opCodes.includes(code))
        );
        setAvailableOperationGroups(availableGroups);

        // Set available rigs
        const rigNames = options.rig_names || [];
        setRigs(rigNames.filter(Boolean));

        // Set available muds
        const mudNames = options.mud_names || [];
        setMuds(mudNames.filter(Boolean));
      }

      // Clear selections that are no longer valid
      setSelectedHoleSizes(prev => prev.filter(s => availableHoleSizes.includes(s)));
      setSelectedRigs(prev => prev.filter(r => rigs.includes(r)));
      setSelectedMuds(prev => prev.filter(m => muds.includes(m)));
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchFieldsAndRigs = async () => {
    try {
      // Fetch unique fields
      const { data: fieldsData } = await supabase
        .from('fields')
        .select('field_code, field_name')
        .order('field_name');

      if (fieldsData) {
        setFields(fieldsData);
      }

      // Fetch distinct rig names using RPC function
      const { data: rigsData, error: rigsError } = await supabase
        .rpc('get_distinct_rigs');

      if (rigsError) {
        console.error('Error fetching rigs via RPC:', rigsError);
        // Fallback to direct query with higher limit
        const { data: fallbackRigs } = await supabase
          .from('daily_reports')
          .select('rig_name')
          .not('rig_name', 'is', null)
          .neq('rig_name', '')
          .order('rig_name')
          .range(0, 99999);
        if (fallbackRigs) {
          const uniqueRigs = [...new Set(fallbackRigs.map(r => r.rig_name))].filter(Boolean).sort();
          setRigs(uniqueRigs);
        }
      } else if (rigsData) {
        const uniqueRigs = rigsData.map(r => r.rig_name).filter(Boolean);
        setRigs(uniqueRigs);
      }

      // Fetch distinct mud names using RPC function
      const { data: mudsData, error: mudsError } = await supabase
        .rpc('get_distinct_muds');

      if (mudsError) {
        console.error('Error fetching muds via RPC:', mudsError);
        // Fallback to direct query with higher limit
        const { data: fallbackMuds } = await supabase
          .from('daily_reports')
          .select('mud_name')
          .not('mud_name', 'is', null)
          .neq('mud_name', '')
          .order('mud_name')
          .range(0, 99999);
        if (fallbackMuds) {
          const uniqueMuds = [...new Set(fallbackMuds.map(m => m.mud_name))].filter(Boolean).sort();
          setMuds(uniqueMuds);
        }
      } else if (mudsData) {
        const uniqueMuds = mudsData.map(m => m.mud_name).filter(Boolean);
        setMuds(uniqueMuds);
      }
    } catch (error) {
      console.error('Error fetching fields, rigs and muds:', error);
    }
  };

  const fetchKeywordGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('keyword_groups')
        .select('*')
        .order('name');

      if (error) {
        console.log('keyword_groups table may not exist yet, using defaults');
        return;
      }

      if (data && data.length > 0) {
        // Merge with defaults
        const mergedGroups = [...DEFAULT_KEYWORD_GROUPS];
        data.forEach(dbGroup => {
          const existingIndex = mergedGroups.findIndex(g => g.id === dbGroup.id);
          if (existingIndex >= 0) {
            mergedGroups[existingIndex] = dbGroup;
          } else {
            mergedGroups.push(dbGroup);
          }
        });
        setKeywordGroups(mergedGroups);
      }
    } catch (error) {
      console.error('Error fetching keyword groups:', error);
    }
  };

  const buildSearchQuery = () => {
    // Build keyword patterns for search
    let patterns = [];

    // Add keywords from selected groups
    selectedKeywordGroups.forEach(groupId => {
      const group = keywordGroups.find(g => g.id === groupId);
      if (group && group.or_keywords) {
        const orParts = group.or_keywords.split(/[,;]/).map(k => k.trim()).filter(Boolean);
        patterns.push(...orParts);
      }
    });

    // Add OR keywords
    if (orKeywords.trim()) {
      const orParts = orKeywords.split(/[,;]/).map(k => k.trim()).filter(Boolean);
      patterns.push(...orParts);
    }

    return patterns;
  };

  const handleSearch = async () => {
    setLoading(true);
    setCurrentPage(1); // Reset to first page on new search
    try {
      let query = supabase
        .from('daily_reports')
        .select('*', { count: 'exact' });

      // Apply date filters
      if (dateRange.startDate) {
        query = query.gte('report_date', dateRange.startDate);
      }
      if (dateRange.endDate) {
        query = query.lte('report_date', dateRange.endDate);
      }

      // Apply well filter
      // If specific wells are selected, filter by them
      // Otherwise, if wells prop has items (filtered by field), filter by those
      if (selectedWells.length > 0) {
        query = query.in('well_name', selectedWells);
      } else if (wells.length > 0) {
        // Filter by all wells in the current field selection
        query = query.in('well_name', wells);
      }

      // Apply hole size filter
      if (selectedHoleSizes.length > 0) {
        query = query.in('hole_size', selectedHoleSizes);
      }

      // Apply operation code filter - expand group names to their codes
      if (selectedOperationCodes.length > 0) {
        const allCodes = [];
        selectedOperationCodes.forEach(groupName => {
          const group = ALL_OPERATION_CODE_GROUPS.find(g => g.name === groupName);
          if (group) {
            allCodes.push(...group.codes);
          }
        });
        if (allCodes.length > 0) {
          query = query.in('operation_code', allCodes);
        }
      }

      // Apply rig filter
      if (selectedRigs.length > 0) {
        query = query.in('rig_name', selectedRigs);
      }

      // Apply mud filter
      if (selectedMuds.length > 0) {
        query = query.in('mud_name', selectedMuds);
      }

      // Build keyword search
      const patterns = buildSearchQuery();

      // Get AND keywords from selected groups
      let allAndKeywords = andKeywords.trim();
      selectedKeywordGroups.forEach(groupId => {
        const group = keywordGroups.find(g => g.id === groupId);
        if (group && group.and_keywords) {
          allAndKeywords += (allAndKeywords ? ', ' : '') + group.and_keywords;
        }
      });

      // Apply AND keywords (must contain all)
      if (allAndKeywords) {
        const andParts = allAndKeywords.split(/[,;]/).map(k => k.trim()).filter(Boolean);
        andParts.forEach(keyword => {
          query = query.ilike('operations_summary', `%${keyword}%`);
        });
      }

      // Apply OR keywords (must contain at least one)
      if (patterns.length > 0) {
        const orConditions = patterns.map(p => `operations_summary.ilike.%${p}%`).join(',');
        query = query.or(orConditions);
      }

      // Get NOT keywords from selected groups
      let allNotKeywords = notKeywords.trim();
      selectedKeywordGroups.forEach(groupId => {
        const group = keywordGroups.find(g => g.id === groupId);
        if (group && group.not_keywords) {
          allNotKeywords += (allNotKeywords ? ', ' : '') + group.not_keywords;
        }
      });

      // Apply NOT keywords (must not contain)
      if (allNotKeywords) {
        const notParts = allNotKeywords.split(/[,;]/).map(k => k.trim()).filter(Boolean);
        notParts.forEach(keyword => {
          query = query.not('operations_summary', 'ilike', `%${keyword}%`);
        });
      }

      // Order by well name first, then by date (so all wells are represented)
      query = query.order('well_name', { ascending: true });
      query = query.order('report_date', { ascending: true });

      // Limit results - increase to 5000 to show more data
      query = query.limit(5000);

      const { data, error, count } = await query;

      if (error) throw error;

      setSearchResults(data || []);
      setTotalCount(count || 0);

    } catch (error) {
      console.error('Error searching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (searchResults.length === 0) return;

    // Create CSV content
    const headers = [
      'HOLESIZE', 'frompoint', 'topoint', 'mudname', 'MINWEIGHT', 'MAXWEIGHT',
      'rig', 'WellCode', 'fDate', 'OperationCode', 'FTime', 'TTime', 'Description'
    ];

    const rows = searchResults.map(r => [
      r.hole_size || '',
      r.hole_depth_start || '',
      r.hole_depth_end || '',
      r.mud_name || '',
      r.min_weight || '',
      r.max_weight || '',
      r.rig_name || '',
      r.well_name || '',
      r.report_date || '',
      r.operation_code || '',
      r.from_time || '',
      r.to_time || '',
      `"${(r.operations_summary || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    // Download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `remarks_summary_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  // Unit3 style - Row click opens detailed report
  const handleRowClick = async (report, index) => {
    setSelectedReport(report);
    setCurrentReportIndex(index);
    setShowReportModal(true);
  };

  // Unit10 style - Navigation between reports
  const navigateReport = (direction) => {
    let newIndex = currentReportIndex;

    switch (direction) {
      case 'first':
        newIndex = 0;
        break;
      case 'prev':
        newIndex = Math.max(0, currentReportIndex - 1);
        break;
      case 'next':
        newIndex = Math.min(searchResults.length - 1, currentReportIndex + 1);
        break;
      case 'last':
        newIndex = searchResults.length - 1;
        break;
      default:
        break;
    }

    if (newIndex !== currentReportIndex && searchResults[newIndex]) {
      setCurrentReportIndex(newIndex);
      setSelectedReport(searchResults[newIndex]);
    }
  };

  const toggleKeywordGroup = (groupId) => {
    setSelectedKeywordGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleHoleSize = (size) => {
    setSelectedHoleSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const toggleOperationCode = (code) => {
    setSelectedOperationCodes(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const toggleRig = (rig) => {
    setSelectedRigs(prev =>
      prev.includes(rig)
        ? prev.filter(r => r !== rig)
        : [...prev, rig]
    );
  };

  const toggleMud = (mud) => {
    setSelectedMuds(prev =>
      prev.includes(mud)
        ? prev.filter(m => m !== mud)
        : [...prev, mud]
    );
  };

  // Select All / Deselect All functions
  const toggleAllHoleSizes = () => {
    if (selectedHoleSizes.length === availableHoleSizes.length) {
      setSelectedHoleSizes([]);
    } else {
      setSelectedHoleSizes([...availableHoleSizes]);
    }
  };

  const toggleAllOperationCodes = () => {
    const allNames = availableOperationGroups.map(g => g.name);
    if (selectedOperationCodes.length === allNames.length) {
      setSelectedOperationCodes([]);
    } else {
      setSelectedOperationCodes(allNames);
    }
  };

  const toggleAllRigs = () => {
    if (selectedRigs.length === rigs.length) {
      setSelectedRigs([]);
    } else {
      setSelectedRigs([...rigs]);
    }
  };

  const toggleAllMuds = () => {
    if (selectedMuds.length === muds.length) {
      setSelectedMuds([]);
    } else {
      setSelectedMuds([...muds]);
    }
  };

  const clearAllFilters = () => {
    setSelectedHoleSizes([]);
    setSelectedOperationCodes([]);
    setSelectedKeywordGroups([]);
    setAndKeywords('');
    setOrKeywords('');
    setNotKeywords('');
    setSelectedFields([]);
    setSelectedRigs([]);
    setSelectedMuds([]);
  };

  // Unit2 style - Group Management Functions
  const openNewGroupModal = () => {
    setEditingGroup(null);
    setGroupForm({
      name: '',
      description: '',
      and_keywords: '',
      or_keywords: '',
      not_keywords: '',
      sql_code: ''
    });
    setShowGroupModal(true);
  };

  const openEditGroupModal = (group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name || '',
      description: group.description || '',
      and_keywords: group.and_keywords || '',
      or_keywords: group.or_keywords || '',
      not_keywords: group.not_keywords || '',
      sql_code: group.sql_code || ''
    });
    setShowGroupModal(true);
  };

  const handleSaveGroup = async () => {
    if (!groupForm.name.trim()) {
      alert('Group name is required');
      return;
    }

    try {
      const groupData = {
        name: groupForm.name.trim(),
        description: groupForm.description.trim(),
        and_keywords: groupForm.and_keywords.trim(),
        or_keywords: groupForm.or_keywords.trim(),
        not_keywords: groupForm.not_keywords.trim(),
        sql_code: groupForm.sql_code.trim()
      };

      if (editingGroup && !editingGroup.id.startsWith('problems') && !DEFAULT_KEYWORD_GROUPS.find(g => g.id === editingGroup.id)) {
        // Update existing custom group
        const { error } = await supabase
          .from('keyword_groups')
          .update(groupData)
          .eq('id', editingGroup.id);

        if (error) throw error;

        setKeywordGroups(prev => prev.map(g =>
          g.id === editingGroup.id ? { ...g, ...groupData } : g
        ));
      } else {
        // Create new group
        const newId = `custom_${Date.now()}`;
        const { error } = await supabase
          .from('keyword_groups')
          .insert({ id: newId, ...groupData });

        if (error) {
          // Table might not exist, add locally
          console.log('Saving locally:', error);
        }

        setKeywordGroups(prev => [...prev, { id: newId, ...groupData }]);
      }

      setShowGroupModal(false);
    } catch (error) {
      console.error('Error saving group:', error);
      alert('Error saving group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    // Don't allow deleting default groups
    if (DEFAULT_KEYWORD_GROUPS.find(g => g.id === groupId)) {
      alert('Cannot delete default groups');
      return;
    }

    if (!confirm('Are you sure you want to delete this group?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('keyword_groups')
        .delete()
        .eq('id', groupId);

      if (error) {
        console.log('Error deleting from DB:', error);
      }

      setKeywordGroups(prev => prev.filter(g => g.id !== groupId));
      setSelectedKeywordGroups(prev => prev.filter(id => id !== groupId));
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const applyGroupToSearch = (group) => {
    if (group.and_keywords) {
      setAndKeywords(prev => prev ? `${prev}, ${group.and_keywords}` : group.and_keywords);
    }
    if (group.or_keywords) {
      setOrKeywords(prev => prev ? `${prev}, ${group.or_keywords}` : group.or_keywords);
    }
    if (group.not_keywords) {
      setNotKeywords(prev => prev ? `${prev}, ${group.not_keywords}` : group.not_keywords);
    }
  };

  // Generate SQL preview for advanced users
  const generateSQLPreview = () => {
    let sql = 'SELECT * FROM daily_reports WHERE 1=1';

    if (dateRange.startDate) {
      sql += ` AND report_date >= '${dateRange.startDate}'`;
    }
    if (dateRange.endDate) {
      sql += ` AND report_date <= '${dateRange.endDate}'`;
    }
    if (selectedWells.length > 0) {
      sql += ` AND well_name IN ('${selectedWells.join("','")}')`;
    }

    const patterns = buildSearchQuery();
    if (patterns.length > 0) {
      const orConditions = patterns.map(p => `operations_summary ILIKE '%${p}%'`).join(' OR ');
      sql += ` AND (${orConditions})`;
    }

    if (andKeywords.trim()) {
      const andParts = andKeywords.split(/[,;]/).map(k => k.trim()).filter(Boolean);
      andParts.forEach(keyword => {
        sql += ` AND operations_summary ILIKE '%${keyword}%'`;
      });
    }

    if (notKeywords.trim()) {
      const notParts = notKeywords.split(/[,;]/).map(k => k.trim()).filter(Boolean);
      notParts.forEach(keyword => {
        sql += ` AND operations_summary NOT ILIKE '%${keyword}%'`;
      });
    }

    return sql;
  };

  return (
    <div className="remarks-summary-container">
      {/* Search Filters Panel */}
      <div className="search-filters-panel">
        <div className="filter-row">
          <div className="filter-group keyword-search">
            <label>AND (Must contain all):</label>
            <input
              type="text"
              value={andKeywords}
              onChange={(e) => setAndKeywords(e.target.value)}
              placeholder="keyword1, keyword2"
              className="keyword-input"
            />
          </div>

          <div className="filter-group keyword-search">
            <label>OR (Contains any):</label>
            <input
              type="text"
              value={orKeywords}
              onChange={(e) => setOrKeywords(e.target.value)}
              placeholder='"WASH AND REAM" W&R "W & R" "BACK REAM"'
              className="keyword-input"
            />
          </div>

          <div className="filter-group keyword-search">
            <label>NOT (Exclude):</label>
            <input
              type="text"
              value={notKeywords}
              onChange={(e) => setNotKeywords(e.target.value)}
              placeholder="exclude these words"
              className="keyword-input"
            />
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group sql-preview">
            <label>SQL CMD:</label>
            <input
              type="text"
              value={generateSQLPreview()}
              readOnly
              className="sql-input"
            />
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn-primary" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Run Search'}
          </button>
          <button className="btn-secondary" onClick={clearAllFilters}>
            Clear Filters
          </button>
          <button className="btn-export" onClick={handleExportExcel}>
            Export Excel
          </button>
          <button className="btn-print" onClick={handlePrint}>
            Print
          </button>
          <button className="btn-group-manage" onClick={openNewGroupModal}>
            + New Group
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="remarks-main-content">
        {/* Left Sidebar - Additional Filters */}
        <aside className="remarks-sidebar">
          {/* View Mode Toggle */}
          <div className="filter-section">
            <div className="view-mode-toggle">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showTimeIncluded}
                  onChange={(e) => setShowTimeIncluded(e.target.checked)}
                />
                <span>TIME INCLUDED</span>
              </label>
            </div>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="viewMode"
                  value="remarks"
                  checked={viewMode === 'remarks'}
                  onChange={() => setViewMode('remarks')}
                />
                <span>REMARKS</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="viewMode"
                  value="summary"
                  checked={viewMode === 'summary'}
                  onChange={() => setViewMode('summary')}
                />
                <span>SUMMARY</span>
              </label>
            </div>
          </div>

          {/* Hole Sizes */}
          <div className="filter-section">
            <div className="filter-header">
              <h4>Hole Sizes</h4>
              <div className="filter-controls">
                <button className="btn-text" onClick={toggleAllHoleSizes} disabled={availableHoleSizes.length === 0}>
                  {selectedHoleSizes.length === availableHoleSizes.length && availableHoleSizes.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
                <span className="filter-count">{selectedHoleSizes.length}/{availableHoleSizes.length}</span>
              </div>
            </div>
            <div className="checkbox-list scrollable">
              {availableHoleSizes.length === 0 ? (
                <p className="empty-list">No hole sizes available</p>
              ) : (
                availableHoleSizes.map(size => (
                  <label key={size} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedHoleSizes.includes(size)}
                      onChange={() => toggleHoleSize(size)}
                    />
                    <span>{size}"</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Operation Codes */}
          <div className="filter-section">
            <div className="filter-header">
              <h4>Operation Codes</h4>
              <div className="filter-controls">
                <button className="btn-text" onClick={toggleAllOperationCodes} disabled={availableOperationGroups.length === 0}>
                  {selectedOperationCodes.length === availableOperationGroups.length && availableOperationGroups.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
                <span className="filter-count">{selectedOperationCodes.length}/{availableOperationGroups.length}</span>
              </div>
            </div>
            <div className="checkbox-list scrollable">
              {availableOperationGroups.length === 0 ? (
                <p className="empty-list">No operation codes available</p>
              ) : (
                availableOperationGroups.map(group => (
                  <label key={group.name} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedOperationCodes.includes(group.name)}
                      onChange={() => toggleOperationCode(group.name)}
                    />
                    <span>{group.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Rigs */}
          <div className="filter-section">
            <div className="filter-header">
              <h4>Drilling Rigs</h4>
              <div className="filter-controls">
                <button className="btn-text" onClick={toggleAllRigs} disabled={rigs.length === 0}>
                  {selectedRigs.length === rigs.length && rigs.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
                <span className="filter-count">{selectedRigs.length}/{rigs.length}</span>
              </div>
            </div>
            <div className="checkbox-list scrollable">
              {rigs.length === 0 ? (
                <p className="empty-list">No drilling rigs available</p>
              ) : (
                rigs.map(rig => (
                  <label key={rig} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedRigs.includes(rig)}
                      onChange={() => toggleRig(rig)}
                    />
                    <span>{rig}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Muds */}
          <div className="filter-section">
            <div className="filter-header">
              <h4>Mud System</h4>
              <div className="filter-controls">
                <button className="btn-text" onClick={toggleAllMuds} disabled={muds.length === 0}>
                  {selectedMuds.length === muds.length && muds.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
                <span className="filter-count">{selectedMuds.length}/{muds.length}</span>
              </div>
            </div>
            <div className="checkbox-list scrollable">
              {muds.length === 0 ? (
                <p className="empty-list">No mud systems available</p>
              ) : (
                muds.map(mud => (
                  <label key={mud} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedMuds.includes(mud)}
                      onChange={() => toggleMud(mud)}
                    />
                    <span>{mud}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Keyword Groups - Unit2 style */}
          <div className="filter-section">
            <h4>Saved Search Groups</h4>
            <div className="keyword-groups">
              {keywordGroups.map(group => (
                <div
                  key={group.id}
                  className={`keyword-group-item ${selectedKeywordGroups.includes(group.id) ? 'selected' : ''}`}
                >
                  <div
                    className="group-main"
                    onClick={() => toggleKeywordGroup(group.id)}
                    title={`AND: ${group.and_keywords || '-'}\nOR: ${group.or_keywords || '-'}\nNOT: ${group.not_keywords || '-'}`}
                  >
                    <span className="group-name">{group.name}</span>
                    <span className="group-desc">{group.description}</span>
                  </div>
                  <div className="group-actions">
                    <button
                      className="btn-apply-group"
                      onClick={(e) => { e.stopPropagation(); applyGroupToSearch(group); }}
                      title="Apply to search fields"
                    >
                      ↓
                    </button>
                    <button
                      className="btn-edit-group"
                      onClick={(e) => { e.stopPropagation(); openEditGroupModal(group); }}
                      title="Edit group"
                    >
                      ✎
                    </button>
                    {!DEFAULT_KEYWORD_GROUPS.find(g => g.id === group.id) && (
                      <button
                        className="btn-delete-group"
                        onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                        title="Delete group"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Results Table */}
        <div className="remarks-results">
          <div className="results-header">
            <span className="results-count">
              Found: {totalCount.toLocaleString()} records
              {searchResults.length < totalCount && ` (loaded ${searchResults.length})`}
            </span>
            <div className="pagination-controls">
              <label>
                Show:
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPageSize(value === 'All' ? 'All' : parseInt(value));
                    setCurrentPage(1);
                  }}
                  className="page-size-select"
                >
                  {PAGE_SIZE_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="results-table-container">
            <table className="remarks-table">
              <thead>
                <tr>
                  <th>HOLESIZE</th>
                  <th>frompoint</th>
                  <th>topoint</th>
                  <th>mudname</th>
                  <th>MINWEIGHT</th>
                  <th>MAXWEIGHT</th>
                  <th>rig</th>
                  <th>WellCode</th>
                  <th>fDate</th>
                  <th>OperationCode</th>
                  <th>FTime</th>
                  <th>TTime</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="13" className="loading-cell">Loading...</td>
                  </tr>
                ) : searchResults.length === 0 ? (
                  <tr>
                    <td colSpan="13" className="empty-cell">
                      No results found. Adjust your filters and click "Run Search".
                    </td>
                  </tr>
                ) : (
                  (() => {
                    const effectivePageSize = pageSize === 'All' ? searchResults.length : pageSize;
                    const startIndex = (currentPage - 1) * effectivePageSize;
                    const endIndex = startIndex + effectivePageSize;
                    const paginatedResults = searchResults.slice(startIndex, endIndex);

                    return paginatedResults.map((report, index) => (
                      <tr
                        key={report.id || (startIndex + index)}
                        onClick={() => handleRowClick(report, startIndex + index)}
                        className="clickable-row"
                      >
                        <td>{report.hole_size || '-'}</td>
                        <td>{report.hole_depth_start || '-'}</td>
                        <td>{report.hole_depth_end || '-'}</td>
                        <td>{report.mud_name || '-'}</td>
                        <td>{report.min_weight || '-'}</td>
                        <td>{report.max_weight || '-'}</td>
                        <td>{report.rig_name || '-'}</td>
                        <td>{report.well_name || '-'}</td>
                        <td>{formatShamsiDate(report.report_date, 'numeric')}</td>
                        <td>{report.operation_code || '-'}</td>
                        <td>{report.from_time || '-'}</td>
                        <td>{report.to_time || '-'}</td>
                        <td className="description-cell">
                          {report.operations_summary?.substring(0, 100)}
                          {report.operations_summary?.length > 100 ? '...' : ''}
                        </td>
                      </tr>
                    ));
                  })()
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Navigation */}
          {searchResults.length > 0 && pageSize !== 'All' && (
            <div className="pagination-nav">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </button>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="pagination-info">
                Page {currentPage} of {Math.ceil(searchResults.length / pageSize)}
                {' '}({((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, searchResults.length)} of {searchResults.length})
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(searchResults.length / pageSize), prev + 1))}
                disabled={currentPage >= Math.ceil(searchResults.length / pageSize)}
              >
                Next
              </button>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(Math.ceil(searchResults.length / pageSize))}
                disabled={currentPage >= Math.ceil(searchResults.length / pageSize)}
              >
                Last
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Unit2 Style - Group Management Modal */}
      {showGroupModal && (
        <div className="modal-overlay" onClick={() => setShowGroupModal(false)}>
          <div className="group-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingGroup ? 'Edit Group' : 'New Search Group'}</h2>
              <button className="modal-close" onClick={() => setShowGroupModal(false)}>&times;</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>GROUP (Name):</label>
                <input
                  type="text"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Group name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>DESC (Description):</label>
                <input
                  type="text"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>AND (Must contain all):</label>
                <input
                  type="text"
                  value={groupForm.and_keywords}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, and_keywords: e.target.value }))}
                  placeholder="keyword1, keyword2"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>OR (Contains any):</label>
                <input
                  type="text"
                  value={groupForm.or_keywords}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, or_keywords: e.target.value }))}
                  placeholder="keyword1, keyword2"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>NOT (Exclude):</label>
                <input
                  type="text"
                  value={groupForm.not_keywords}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, not_keywords: e.target.value }))}
                  placeholder="exclude1, exclude2"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>SQLCODE (Custom SQL):</label>
                <textarea
                  value={groupForm.sql_code}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, sql_code: e.target.value }))}
                  placeholder="Custom SQL WHERE clause"
                  className="form-input form-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={handleSaveGroup}>
                Save Group
              </button>
              <button className="btn-secondary" onClick={() => setShowGroupModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DR.xls Style - Daily Drilling Report Modal */}
      {showReportModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="ddr-modal" onClick={e => e.stopPropagation()}>
            {/* Modal Header with Navigation */}
            <div className="ddr-modal-header">
              <h2>DAILY DRILLING REPORT</h2>
              <div className="report-navigation">
                <button className="nav-btn" onClick={() => navigateReport('first')} disabled={currentReportIndex === 0} title="First">|◀</button>
                <button className="nav-btn" onClick={() => navigateReport('prev')} disabled={currentReportIndex === 0} title="Previous">◀</button>
                <span className="nav-info">{currentReportIndex + 1} / {searchResults.length}</span>
                <button className="nav-btn" onClick={() => navigateReport('next')} disabled={currentReportIndex === searchResults.length - 1} title="Next">▶</button>
                <button className="nav-btn" onClick={() => navigateReport('last')} disabled={currentReportIndex === searchResults.length - 1} title="Last">▶|</button>
              </div>
              <button className="modal-close" onClick={() => setShowReportModal(false)}>&times;</button>
            </div>

            <div className="ddr-modal-body">
              {/* Header Row 1 */}
              <div className="ddr-header-row">
                <div className="ddr-field"><span className="ddr-label">DATE:</span><span className="ddr-value">{formatShamsiDate(selectedReport.report_date, 'numeric')}</span></div>
                <div className="ddr-field"><span className="ddr-label">FIELD:</span><span className="ddr-value">{selectedReport.field || selectedReport.field_name || '-'}</span></div>
                <div className="ddr-field"><span className="ddr-label">WELL NO.:</span><span className="ddr-value">{selectedReport.well_name}</span></div>
                <div className="ddr-field"><span className="ddr-label">OP. TYPE:</span><span className="ddr-value">{selectedReport.operation_type || '-'}</span></div>
                <div className="ddr-field"><span className="ddr-label">REPORT NO:</span><span className="ddr-value">{selectedReport.serial_no || selectedReport.id}</span></div>
              </div>

              {/* Header Row 2 */}
              <div className="ddr-header-row">
                <div className="ddr-field"><span className="ddr-label">RIG NO:</span><span className="ddr-value">{selectedReport.rig_name || '-'}</span></div>
                <div className="ddr-field"><span className="ddr-label">SPUD DATE:</span><span className="ddr-value">{selectedReport.spud_date ? formatShamsiDate(selectedReport.spud_date, 'numeric') : '-'}</span></div>
                <div className="ddr-field"><span className="ddr-label">DAYS FROM SPUD:</span><span className="ddr-value">{selectedReport.days_since_spud || selectedReport.serial_no || '-'}</span></div>
                <div className="ddr-field"><span className="ddr-label">ACT RIG DAYS:</span><span className="ddr-value">{selectedReport.act_rig_days || '-'}</span></div>
              </div>

              {/* Main Content - 3 Column Layout */}
              <div className="ddr-main-content">
                {/* Left Column - Well/Drilling Info */}
                <div className="ddr-column">
                  <div className="ddr-section">
                    <div className="ddr-section-title">DEPTH INFORMATION</div>
                    <div className="ddr-row"><span className="ddr-label">MORNING DEPTH:</span><span className="ddr-value">{selectedReport.morning_depth || selectedReport.hole_depth_start || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">MIDNIGHT DEPTH:</span><span className="ddr-value">{selectedReport.midnight_depth || selectedReport.hole_depth_end || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">PREVIOUS DEPTH:</span><span className="ddr-value">{selectedReport.previous_depth || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">METERAGE:</span><span className="ddr-value">{selectedReport.progress_24hr || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">DRILLING TIME:</span><span className="ddr-value">{selectedReport.drilling_time || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">CUM. DRLG TIME:</span><span className="ddr-value">{selectedReport.cum_drilling_time || '-'}</span></div>
                  </div>

                  <div className="ddr-section">
                    <div className="ddr-section-title">FORMATION</div>
                    <div className="ddr-row"><span className="ddr-label">FORMATION:</span><span className="ddr-value">{selectedReport.formation || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">LITHOLOGY:</span><span className="ddr-value">{selectedReport.lithology || '-'}</span></div>
                  </div>

                  <div className="ddr-section">
                    <div className="ddr-section-title">CASING DATA</div>
                    <div className="ddr-row"><span className="ddr-label">LAST CASING:</span><span className="ddr-value">{selectedReport.last_casing || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">LINER LAP:</span><span className="ddr-value">{selectedReport.liner_lap || '-'}</span></div>
                  </div>

                  <div className="ddr-section">
                    <div className="ddr-section-title">PERSONNEL</div>
                    <div className="ddr-row"><span className="ddr-label">WELLSITE SUPT.:</span><span className="ddr-value">{selectedReport.well_site_superintendent || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">OPN. SUPT.:</span><span className="ddr-value">{selectedReport.operation_superintendent || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">GEOLOGIST:</span><span className="ddr-value">{selectedReport.geologist || '-'}</span></div>
                  </div>
                </div>

                {/* Middle Column - Bit Info */}
                <div className="ddr-column">
                  <div className="ddr-section">
                    <div className="ddr-section-title">BIT DATA</div>
                    <div className="ddr-row"><span className="ddr-label">BIT NO.:</span><span className="ddr-value">{selectedReport.bit_no || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">BIT SIZE:</span><span className="ddr-value">{selectedReport.hole_size || '-'}"</span></div>
                    <div className="ddr-row"><span className="ddr-label">BIT TYPE:</span><span className="ddr-value">{selectedReport.bit_type || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">IADC CODE:</span><span className="ddr-value">{selectedReport.iadc_code || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">NOZZLE SIZE/TFA:</span><span className="ddr-value">{selectedReport.nozzle_size || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">BIT METR.(TOTAL):</span><span className="ddr-value">{selectedReport.bit_meterage || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">BIT HOURS (TOT):</span><span className="ddr-value">{selectedReport.bit_hours || '-'}</span></div>
                  </div>

                  <div className="ddr-section">
                    <div className="ddr-section-title">DRILLING PARAMETERS</div>
                    <div className="ddr-row"><span className="ddr-label">WT. ON BIT (MN/MX):</span><span className="ddr-value">{selectedReport.wob_min || '-'} / {selectedReport.wob_max || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">RPM:</span><span className="ddr-value">{selectedReport.rpm || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">TORQUE:</span><span className="ddr-value">{selectedReport.torque || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">BIT ROP (M/H):</span><span className="ddr-value">{selectedReport.rop || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">BIT CONDITION:</span><span className="ddr-value">{selectedReport.bit_condition || '-'}</span></div>
                  </div>

                  <div className="ddr-section">
                    <div className="ddr-section-title">PUMP DATA</div>
                    <div className="ddr-row"><span className="ddr-label">PUMP TYPE:</span><span className="ddr-value">{selectedReport.pump_type || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">PUMP LINER SIZE:</span><span className="ddr-value">{selectedReport.pump_liner_size || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">PUMP OUTPUT (GPM):</span><span className="ddr-value">{selectedReport.pump_output || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">PUMP PRESSURE:</span><span className="ddr-value">{selectedReport.pump_pressure || '-'}</span></div>
                  </div>
                </div>

                {/* Right Column - Mud Properties */}
                <div className="ddr-column">
                  <div className="ddr-section">
                    <div className="ddr-section-title">MUD PROPERTIES</div>
                    <div className="ddr-row"><span className="ddr-label">MUD TYPE:</span><span className="ddr-value">{selectedReport.mud_name || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">MW: MAX / MIN:</span><span className="ddr-value">{selectedReport.max_weight || '-'} / {selectedReport.min_weight || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">M.F.VIS:</span><span className="ddr-value">{selectedReport.mf_vis || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">PV:</span><span className="ddr-value">{selectedReport.pv || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">YP:</span><span className="ddr-value">{selectedReport.yp || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">PH:</span><span className="ddr-value">{selectedReport.ph || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">CHLORIDE (PPM):</span><span className="ddr-value">{selectedReport.chloride || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">TEMP (F):</span><span className="ddr-value">{selectedReport.mud_temp || '-'}</span></div>
                  </div>

                  <div className="ddr-section">
                    <div className="ddr-section-title">SOLID CONTROL</div>
                    <div className="ddr-row"><span className="ddr-label">RETORT SOLID %:</span><span className="ddr-value">{selectedReport.retort_solid || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">OIL (%):</span><span className="ddr-value">{selectedReport.oil_percent || '-'}</span></div>
                    <div className="ddr-row"><span className="ddr-label">WATER (%):</span><span className="ddr-value">{selectedReport.water_percent || '-'}</span></div>
                  </div>

                  <div className="ddr-section">
                    <div className="ddr-section-title">MUD VOLUME</div>
                    <div className="ddr-row"><span className="ddr-label">MUD STORAGE:</span><span className="ddr-value">{selectedReport.mud_storage || '-'} BBL</span></div>
                    <div className="ddr-row"><span className="ddr-label">MUD LOSS:</span><span className="ddr-value">{selectedReport.mud_loss || '-'} BBL</span></div>
                    <div className="ddr-row"><span className="ddr-label">MUD GAINS:</span><span className="ddr-value">{selectedReport.mud_gains || '-'} BBL</span></div>
                  </div>
                </div>
              </div>

              {/* Operations Table */}
              <div className="ddr-operations-section">
                <div className="ddr-section-title">OPERATIONS</div>
                <table className="ddr-operations-table">
                  <thead>
                    <tr>
                      <th>TIME</th>
                      <th>OP.C</th>
                      <th>FROM</th>
                      <th>TO</th>
                      <th>REMARKS / DESCRIPTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{selectedReport.from_time || '00:00'} - {selectedReport.to_time || '24:00'}</td>
                      <td>{selectedReport.operation_code || '-'}</td>
                      <td>{selectedReport.hole_depth_start || '-'}</td>
                      <td>{selectedReport.hole_depth_end || '-'}</td>
                      <td className="ddr-remarks">{selectedReport.operations_summary || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary Section */}
              <div className="ddr-summary-section">
                <div className="ddr-section-title">SUMMARY</div>
                <div className="ddr-summary-text">
                  {selectedReport.operations_summary || 'No summary available'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="ddr-modal-footer">
              <button className="btn-export" onClick={() => {
                const headers = ['Field', 'Value'];
                const data = [
                  ['Report Date', selectedReport.report_date],
                  ['Well Code', selectedReport.well_name],
                  ['Field', selectedReport.field || selectedReport.field_name],
                  ['Rig', selectedReport.rig_name],
                  ['Hole Size', selectedReport.hole_size],
                  ['Morning Depth', selectedReport.morning_depth || selectedReport.hole_depth_start],
                  ['Midnight Depth', selectedReport.midnight_depth || selectedReport.hole_depth_end],
                  ['Progress', selectedReport.progress_24hr],
                  ['Mud Type', selectedReport.mud_name],
                  ['MW Max', selectedReport.max_weight],
                  ['MW Min', selectedReport.min_weight],
                  ['Operation Code', selectedReport.operation_code],
                  ['Operations Summary', selectedReport.operations_summary]
                ];
                const csv = [headers.join(','), ...data.map(r => `"${r[0]}","${(r[1] || '').toString().replace(/"/g, '""')}"`).join('\n')].join('\n');
                const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `DDR_${selectedReport.well_name}_${selectedReport.report_date}.csv`;
                link.click();
              }}>
                Export Report
              </button>
              <button className="btn-print" onClick={() => window.print()}>
                Print Report
              </button>
              <button className="btn-secondary" onClick={() => setShowReportModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemarksAndSummary;
